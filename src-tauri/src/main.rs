#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

fn main() {
    #[cfg(target_os = "linux")]
    configure_linux_webview();

    ordered_sokoban_lib::run();
}

#[cfg(target_os = "linux")]
fn configure_linux_webview() {
    // WebKitGTK can open a completely white window when accelerated
    // compositing is incompatible with the installed GPU driver. Configure
    // the fallback before Tauri initializes the webview. Keep an explicitly
    // supplied value so advanced users can still opt back into acceleration.
    if std::env::var_os("WEBKIT_DISABLE_COMPOSITING_MODE").is_none() {
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }
}
