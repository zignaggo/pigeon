use serde::Serialize;

#[derive(Serialize)]
pub struct NetworkInfo {
    pub ssid: Option<String>,
    pub gateway: Option<String>,
}

pub fn info(app: &tauri::AppHandle) -> NetworkInfo {
    #[cfg(target_os = "android")]
    {
        let (ssid, gateway) =
            std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| android::wifi_info(app)))
                .unwrap_or((None, None));
        NetworkInfo { ssid, gateway }
    }
    #[cfg(target_os = "windows")]
    {
        let _ = app;
        NetworkInfo {
            ssid: windows::ssid(),
            gateway: windows::gateway(),
        }
    }
    #[cfg(not(any(target_os = "android", target_os = "windows")))]
    {
        let _ = app;
        NetworkInfo {
            ssid: None,
            gateway: None,
        }
    }
}

#[cfg(target_os = "windows")]
mod windows {
    fn run(program: &str, args: &[&str]) -> Option<String> {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let out = std::process::Command::new(program)
            .args(args)
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .ok()?;
        Some(String::from_utf8_lossy(&out.stdout).into_owned())
    }

    pub fn ssid() -> Option<String> {
        let text = run("netsh", &["wlan", "show", "interfaces"])?;
        for line in text.lines() {
            let trimmed = line.trim_start();
            if trimmed.starts_with("SSID") && !trimmed.starts_with("BSSID") {
                if let Some((_, value)) = line.split_once(':') {
                    let value = value.trim();
                    if !value.is_empty() {
                        return Some(value.to_string());
                    }
                }
            }
        }
        None
    }

    pub fn gateway() -> Option<String> {
        let text = run("route", &["print", "-4", "0.0.0.0"])?;
        for line in text.lines() {
            let cols: Vec<&str> = line.split_whitespace().collect();
            if cols.len() >= 3 && cols[0] == "0.0.0.0" && cols[1] == "0.0.0.0" {
                if cols[2].parse::<std::net::Ipv4Addr>().is_ok() {
                    return Some(cols[2].to_string());
                }
            }
        }
        None
    }
}

#[cfg(target_os = "android")]
mod android {
    use std::sync::atomic::{AtomicBool, Ordering};

    use jni::objects::{JObject, JString, JValue, JValueOwned};
    use jni::JNIEnv;
    use tauri::AppHandle;

    static PERM_REQUESTED: AtomicBool = AtomicBool::new(false);
    const FINE_LOCATION: &str = "android.permission.ACCESS_FINE_LOCATION";

    pub fn wifi_info(app: &AppHandle) -> (Option<String>, Option<String>) {
        let ctx = ndk_context::android_context();
        let Ok(vm) = (unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) }) else {
            return (None, None);
        };
        let Ok(mut guard) = vm.attach_current_thread() else {
            return (None, None);
        };
        let env = &mut *guard;
        let context = unsafe { JObject::from_raw(ctx.context().cast()) };

        let granted = location_granted(env, &context);
        if !granted && !PERM_REQUESTED.swap(true, Ordering::SeqCst) {
            request_permission_on_main(app);
        }

        let ssid = if granted { read_ssid(env, &context) } else { None };
        let gateway = read_gateway(env, &context);
        (ssid, gateway)
    }

    fn take_obj<'a>(
        env: &mut JNIEnv,
        result: jni::errors::Result<JValueOwned<'a>>,
    ) -> Option<JObject<'a>> {
        match result {
            Ok(value) => value.l().ok(),
            Err(_) => {
                let _ = env.exception_clear();
                None
            }
        }
    }

    fn take_int(env: &mut JNIEnv, result: jni::errors::Result<JValueOwned<'_>>) -> Option<i32> {
        match result {
            Ok(value) => value.i().ok(),
            Err(_) => {
                let _ = env.exception_clear();
                None
            }
        }
    }

    fn location_granted(env: &mut JNIEnv, context: &JObject) -> bool {
        let Ok(perm) = env.new_string(FINE_LOCATION) else {
            let _ = env.exception_clear();
            return false;
        };
        let result = env.call_method(
            context,
            "checkSelfPermission",
            "(Ljava/lang/String;)I",
            &[(&perm).into()],
        );
        take_int(env, result) == Some(0)
    }

    fn wifi_manager<'a>(env: &mut JNIEnv<'a>, context: &JObject) -> Option<JObject<'a>> {
        let service = env
            .new_string("wifi")
            .map_err(|_| {
                let _ = env.exception_clear();
            })
            .ok()?;
        let result = env.call_method(
            context,
            "getSystemService",
            "(Ljava/lang/String;)Ljava/lang/Object;",
            &[(&service).into()],
        );
        take_obj(env, result)
    }

    fn read_ssid(env: &mut JNIEnv, context: &JObject) -> Option<String> {
        let wifi = wifi_manager(env, context)?;
        let info_res =
            env.call_method(&wifi, "getConnectionInfo", "()Landroid/net/wifi/WifiInfo;", &[]);
        let info = take_obj(env, info_res)?;
        if info.is_null() {
            return None;
        }
        let ssid_res = env.call_method(&info, "getSSID", "()Ljava/lang/String;", &[]);
        let raw = take_obj(env, ssid_res)?;
        if raw.is_null() {
            return None;
        }
        let value: String = match env.get_string(&JString::from(raw)) {
            Ok(s) => s.into(),
            Err(_) => {
                let _ = env.exception_clear();
                return None;
            }
        };
        let value = value.trim_matches('"').to_string();
        if value.is_empty() || value == "<unknown ssid>" || value == "0x" {
            None
        } else {
            Some(value)
        }
    }

    fn read_gateway(env: &mut JNIEnv, context: &JObject) -> Option<String> {
        let wifi = wifi_manager(env, context)?;
        let dhcp_res = env.call_method(&wifi, "getDhcpInfo", "()Landroid/net/DhcpInfo;", &[]);
        let dhcp = take_obj(env, dhcp_res)?;
        if dhcp.is_null() {
            return None;
        }
        let field = env.get_field(&dhcp, "gateway", "I");
        let raw = take_int(env, field)?;
        if raw == 0 {
            return None;
        }
        let bytes = (raw as u32).to_le_bytes();
        Some(format!("{}.{}.{}.{}", bytes[0], bytes[1], bytes[2], bytes[3]))
    }

    fn request_permission_on_main(app: &AppHandle) {
        let _ = app.run_on_main_thread(|| {
            let _ = std::panic::catch_unwind(|| {
                let ctx = ndk_context::android_context();
                let Ok(vm) = (unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) }) else {
                    return;
                };
                let Ok(mut guard) = vm.attach_current_thread() else {
                    return;
                };
                let env = &mut *guard;
                let context = unsafe { JObject::from_raw(ctx.context().cast()) };

                let Ok(perm) = env.new_string(FINE_LOCATION) else {
                    let _ = env.exception_clear();
                    return;
                };
                let Ok(string_class) = env.find_class("java/lang/String") else {
                    let _ = env.exception_clear();
                    return;
                };
                let Ok(array) = env.new_object_array(1, string_class, &perm) else {
                    let _ = env.exception_clear();
                    return;
                };
                if env
                    .call_method(
                        &context,
                        "requestPermissions",
                        "([Ljava/lang/String;I)V",
                        &[(&array).into(), JValue::Int(7913)],
                    )
                    .is_err()
                {
                    let _ = env.exception_clear();
                }
            });
        });
    }
}
