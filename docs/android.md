
### Set up android

https://v2.tauri.app/start/prerequisites/#configure-for-mobile-targets

1. Enviroment Variables
  ```
  ANDROID_HOME="C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk"
  NDK_HOME="C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk\\ndk\\29.0.14206865"
  JAVA_HOME="C:\\Program Files\\Android\\Android Studio\\jbr"
  ```
1. rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
