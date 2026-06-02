use serde::Serialize;

#[derive(Serialize)]
pub struct NetworkInfo {
    pub ssid: Option<String>,
    pub gateway: Option<String>,
}

pub fn info() -> NetworkInfo {
    #[cfg(target_os = "android")]
    {
        let (ssid, gateway) = android::wifi_info();
        NetworkInfo { ssid, gateway }
    }
    #[cfg(target_os = "windows")]
    {
        NetworkInfo {
            ssid: windows::ssid(),
            gateway: windows::gateway(),
        }
    }
    #[cfg(not(any(target_os = "android", target_os = "windows")))]
    {
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

    use jni::objects::{JObject, JString, JValue};
    use jni::JNIEnv;

    static PERM_REQUESTED: AtomicBool = AtomicBool::new(false);
    const FINE_LOCATION: &str = "android.permission.ACCESS_FINE_LOCATION";

    pub fn wifi_info() -> (Option<String>, Option<String>) {
        let ctx = ndk_context::android_context();
        let Ok(vm) = (unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) }) else {
            return (None, None);
        };
        let Ok(mut env) = vm.attach_current_thread() else {
            return (None, None);
        };
        let context = unsafe { JObject::from_raw(ctx.context().cast()) };

        if !location_granted(&mut env, &context) {
            if !PERM_REQUESTED.swap(true, Ordering::SeqCst) {
                let _ = request_location(&mut env, &context);
            }
            return (None, gateway(&mut env, &context));
        }

        (ssid(&mut env, &context), gateway(&mut env, &context))
    }

    fn location_granted(env: &mut JNIEnv, context: &JObject) -> bool {
        env.new_string(FINE_LOCATION)
            .ok()
            .and_then(|perm| {
                env.call_method(
                    context,
                    "checkSelfPermission",
                    "(Ljava/lang/String;)I",
                    &[(&perm).into()],
                )
                .ok()?
                .i()
                .ok()
            })
            .map(|code| code == 0)
            .unwrap_or(false)
    }

    fn request_location(env: &mut JNIEnv, context: &JObject) -> Result<(), jni::errors::Error> {
        let perm = env.new_string(FINE_LOCATION)?;
        let string_class = env.find_class("java/lang/String")?;
        let array = env.new_object_array(1, string_class, &perm)?;
        env.call_method(
            context,
            "requestPermissions",
            "([Ljava/lang/String;I)V",
            &[(&array).into(), JValue::Int(7913)],
        )?;
        Ok(())
    }

    fn wifi_manager<'a>(env: &mut JNIEnv<'a>, context: &JObject) -> Option<JObject<'a>> {
        let service = env.new_string("wifi").ok()?;
        env.call_method(
            context,
            "getSystemService",
            "(Ljava/lang/String;)Ljava/lang/Object;",
            &[(&service).into()],
        )
        .ok()?
        .l()
        .ok()
    }

    fn ssid(env: &mut JNIEnv, context: &JObject) -> Option<String> {
        let wifi = wifi_manager(env, context)?;
        let info = env
            .call_method(&wifi, "getConnectionInfo", "()Landroid/net/wifi/WifiInfo;", &[])
            .ok()?
            .l()
            .ok()?;
        let raw = env
            .call_method(&info, "getSSID", "()Ljava/lang/String;", &[])
            .ok()?
            .l()
            .ok()?;
        let value: String = env.get_string(&JString::from(raw)).ok()?.into();
        let value = value.trim_matches('"').to_string();
        if value.is_empty() || value == "<unknown ssid>" || value == "0x" {
            None
        } else {
            Some(value)
        }
    }

    fn gateway(env: &mut JNIEnv, context: &JObject) -> Option<String> {
        let wifi = wifi_manager(env, context)?;
        let dhcp = env
            .call_method(&wifi, "getDhcpInfo", "()Landroid/net/DhcpInfo;", &[])
            .ok()?
            .l()
            .ok()?;
        let raw = env.get_field(&dhcp, "gateway", "I").ok()?.i().ok()?;
        if raw == 0 {
            return None;
        }
        let bytes = (raw as u32).to_le_bytes();
        Some(format!("{}.{}.{}.{}", bytes[0], bytes[1], bytes[2], bytes[3]))
    }
}
