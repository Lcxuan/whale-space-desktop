#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .setup(|_app| {
      {
        use tauri::Manager;
        for window in _app.windows().values() {
          apply_adaptive_window_size(window);
          ensure_startup_centered(window);
        }
      }

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

fn center_window_on_monitor(window: &tauri::Window) {
  let monitor = window
    .current_monitor()
    .ok()
    .flatten()
    .or_else(|| window.primary_monitor().ok().flatten());

  let Some(monitor) = monitor else {
    let _ = window.center();
    return;
  };

  let Ok(window_size) = window.outer_size().or_else(|_| window.inner_size()) else {
    let _ = window.center();
    return;
  };

  let monitor_pos = monitor.position();
  let monitor_size = monitor.size();

  let x = monitor_pos.x
    + (((monitor_size.width as i32).saturating_sub(window_size.width as i32)) / 2).max(0);
  let y = monitor_pos.y
    + (((monitor_size.height as i32).saturating_sub(window_size.height as i32)) / 2).max(0);

  let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition::new(x, y)));
}

fn ensure_startup_centered(window: &tauri::Window) {
  use std::sync::atomic::{AtomicBool, Ordering};
  use std::sync::Arc;
  use tauri::Manager;
  use tauri::WindowEvent;

  let did_center = Arc::new(AtomicBool::new(false));

  let app = window.app_handle();
  let label = window.label().to_string();
  let flag = did_center.clone();
  let _ = window.on_window_event(move |event| {
    if flag.load(Ordering::Relaxed) {
      return;
    }
    match event {
      WindowEvent::Focused(true)
      | WindowEvent::Resized(_)
      | WindowEvent::ScaleFactorChanged { .. } => {
        if let Some(window) = app.get_window(&label) {
          center_window_on_monitor(&window);
          flag.store(true, Ordering::Relaxed);
        }
      }
      _ => {}
    }
  });

  center_window_on_monitor(window);
}

fn apply_adaptive_window_size(window: &tauri::Window) {
  let Ok(current) = window.inner_size() else {
    return;
  };

  if current.width != 1200 || current.height != 800 {
    return;
  }

  let monitor = window
    .current_monitor()
    .ok()
    .flatten()
    .or_else(|| window.primary_monitor().ok().flatten());

  let Some(monitor) = monitor else {
    let _ = window.center();
    return;
  };

  let monitor_size = monitor.size();
  let scale_factor = monitor.scale_factor();

  let max_width = (monitor_size.width.saturating_sub(80)).max(800);
  let max_height = (monitor_size.height.saturating_sub(80)).max(600);

  let desired_width = ((monitor_size.width as f64) * 0.70).round() as u32;
  let desired_height = ((monitor_size.height as f64) * 0.78).round() as u32;

  let width = desired_width.clamp(960, max_width);
  let height = desired_height.clamp(680, max_height);

  let logical = tauri::LogicalSize::new(
    (width as f64) / scale_factor,
    (height as f64) / scale_factor,
  );
  let _ = window.set_size(tauri::Size::Logical(logical));
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
