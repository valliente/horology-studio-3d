fn main() {
  #[cfg(windows)]
  {
    let mut res = winres::WindowsResource::new();
    res.set_manifest_file("../app.manifest");
    res.set("CompanyName", "Antigravity Horology Labs");
    res.set("FileDescription", "Micro-Timegrapher Studio Pro Horological Workstation");
    res.set("LegalCopyright", "Copyright (C) 2026 Antigravity Horology Labs");
    res.set("ProductName", "Micro-Timegrapher Studio Pro");
    if let Err(e) = res.compile() {
      eprintln!("Failed to compile winres: {}", e);
    }
  }
  tauri_build::build()
}
