#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemAudioConfig {
  pub sample_rate: u32,
  pub channels: u16,
  pub is_recording: bool,
}

struct AppState {
  config: Mutex<SystemAudioConfig>,
}

#[tauri::command]
fn get_audio_capabilities() -> Result<SystemAudioConfig, String> {
  Ok(SystemAudioConfig {
    sample_rate: 192000,
    channels: 1,
    is_recording: true,
  })
}

#[tauri::command]
fn ping_dsp_engine() -> String {
  "Micro-Timegrapher Rust Native DSP Engine Ready (192kHz Sampling)".into()
}

fn main() {
  tauri::Builder::default()
    .manage(AppState {
      config: Mutex::new(SystemAudioConfig {
        sample_rate: 192000,
        channels: 1,
        is_recording: false,
      }),
    })
    .invoke_handler(tauri::generate_handler![
      get_audio_capabilities,
      ping_dsp_engine
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
