#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .setup(|_app| {
      #[cfg(target_os = "windows")]
      {
        use tauri::Manager;

        for window in _app.windows().values() {
          apply_window_rounding(window);
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[cfg(target_os = "windows")]
fn apply_window_rounding(window: &tauri::Window) {
  use tauri::WindowEvent;
  use tauri::Manager;

  if let Ok(hwnd) = window.hwnd() {
    set_rounded_corners(hwnd);
  }

  let label = window.label().to_string();
  let app = window.app_handle();

  let _ = window.on_window_event(move |event| match event {
    WindowEvent::Focused(true) | WindowEvent::Resized(_) | WindowEvent::ScaleFactorChanged { .. } => {
      if let Some(window) = app.get_window(&label) {
        if let Ok(hwnd) = window.hwnd() {
          set_rounded_corners(hwnd);
        }
      }
    }
    _ => {}
  });
}

#[cfg(target_os = "windows")]
fn set_rounded_corners(hwnd: windows::Win32::Foundation::HWND) {
  use windows::Win32::Graphics::Dwm::DWMWINDOWATTRIBUTE;

  const DWMWA_WINDOW_CORNER_PREFERENCE: i32 = 33;
  const DWMWCP_ROUND: i32 = 2;

  unsafe {
    let preference: i32 = DWMWCP_ROUND;
    let _ = windows::Win32::Graphics::Dwm::DwmSetWindowAttribute(
      hwnd,
      DWMWINDOWATTRIBUTE(DWMWA_WINDOW_CORNER_PREFERENCE),
      &preference as *const _ as _,
      std::mem::size_of::<i32>() as u32,
    );
  }
}
