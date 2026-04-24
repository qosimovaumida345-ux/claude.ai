#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use tauri::command;

#[command]
fn write_file(path: String, content: String) -> Result<String, String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(format!("✅ Saqlandi: {}", path))
}

#[command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[command]
fn make_dir(path: String) -> Result<String, String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(format!("📁 Papka yaratildi: {}", path))
}

#[command]
fn list_dir(path: String) -> Result<Vec<String>, String> {
    let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut files = vec![];
    for entry in entries.flatten() {
        files.push(entry.path().to_string_lossy().to_string());
    }
    Ok(files)
}

#[command]
fn delete_file(path: String) -> Result<String, String> {
    fs::remove_file(&path).map_err(|e| e.to_string())?;
    Ok(format!("🗑️ O'chirildi: {}", path))
}

#[command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            write_file,
            read_file,
            make_dir,
            list_dir,
            delete_file,
            file_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}