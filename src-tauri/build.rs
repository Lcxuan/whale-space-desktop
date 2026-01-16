fn main() {
  ensure_windows_icon();
  tauri_build::build()
}

fn ensure_windows_icon() {
  let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap_or_else(|_| ".".to_string());
  let icons_dir = std::path::Path::new(&manifest_dir).join("icons");
  let icon_path = icons_dir.join("icon.ico");

  if icon_path.exists() {
    return;
  }

  let _ = std::fs::create_dir_all(&icons_dir);

  let ico_bytes = minimal_1x1_argb_ico();
  let _ = std::fs::write(&icon_path, ico_bytes);
}

fn minimal_1x1_argb_ico() -> Vec<u8> {
  let mut out = Vec::with_capacity(22 + 48);

  out.extend_from_slice(&[0x00, 0x00]);
  out.extend_from_slice(&[0x01, 0x00]);
  out.extend_from_slice(&[0x01, 0x00]);

  out.push(0x01);
  out.push(0x01);
  out.push(0x00);
  out.push(0x00);
  out.extend_from_slice(&[0x01, 0x00]);
  out.extend_from_slice(&[0x20, 0x00]);

  out.extend_from_slice(&(48u32).to_le_bytes());
  out.extend_from_slice(&(22u32).to_le_bytes());

  out.extend_from_slice(&(40u32).to_le_bytes());
  out.extend_from_slice(&(1i32).to_le_bytes());
  out.extend_from_slice(&(2i32).to_le_bytes());
  out.extend_from_slice(&(1u16).to_le_bytes());
  out.extend_from_slice(&(32u16).to_le_bytes());
  out.extend_from_slice(&(0u32).to_le_bytes());
  out.extend_from_slice(&(4u32).to_le_bytes());
  out.extend_from_slice(&(0i32).to_le_bytes());
  out.extend_from_slice(&(0i32).to_le_bytes());
  out.extend_from_slice(&(0u32).to_le_bytes());
  out.extend_from_slice(&(0u32).to_le_bytes());

  out.extend_from_slice(&[0x00, 0x00, 0x00, 0x00]);
  out.extend_from_slice(&[0x00, 0x00, 0x00, 0x00]);

  out
}
