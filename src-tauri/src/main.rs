// main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// 只是入口，调用 lib.rs 中的 run 函数
fn main() {
    tauri_app_lib::run();
}
