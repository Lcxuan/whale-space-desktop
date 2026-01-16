#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(target_os = "windows")]
      {
        use tauri::Manager;

        if let Some(window) = app.get_window("main") {
          if let Ok(hwnd) = window.hwnd() {
            set_rounded_corners(hwnd);
          }
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(target_os = "windows")]
fn set_rounded_corners(hwnd: windows::Win32::Foundation::HWND) {
  use windows::Win32::Graphics::Dwm::DWMWINDOWATTRIBUTE;

  const DWMWA_WINDOW_CORNER_PREFERENCE: i32 = 33;
  const DWMWCP_ROUND: u32 = 2;

  unsafe {
    let preference: u32 = DWMWCP_ROUND;
    let _ = windows::Win32::Graphics::Dwm::DwmSetWindowAttribute(
      hwnd,
      DWMWINDOWATTRIBUTE(DWMWA_WINDOW_CORNER_PREFERENCE),
      &preference as *const _ as _,
      std::mem::size_of::<u32>() as u32,
    );
  }
}
