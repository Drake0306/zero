use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

/// Resolves a relative path within the workspace, rejecting traversal attacks.
fn resolve_safe_path(workspace: &str, relative: &str) -> Result<PathBuf, String> {
    let base = PathBuf::from(workspace)
        .canonicalize()
        .map_err(|e| format!("Invalid workspace path: {e}"))?;

    let joined = base.join(relative);
    let resolved = if joined.exists() {
        joined
            .canonicalize()
            .map_err(|e| format!("Cannot resolve path: {e}"))?
    } else {
        // For paths that don't exist yet (e.g. write_file), resolve the parent
        let parent = joined
            .parent()
            .ok_or_else(|| "Invalid path".to_string())?;
        let parent_resolved = parent
            .canonicalize()
            .map_err(|e| format!("Parent directory does not exist: {e}"))?;
        parent_resolved.join(
            joined
                .file_name()
                .ok_or_else(|| "Invalid file name".to_string())?,
        )
    };

    if !resolved.starts_with(&base) {
        return Err("Path traversal detected: path escapes workspace".to_string());
    }

    Ok(resolved)
}

#[derive(Serialize)]
pub struct DirEntry {
    name: String,
    is_dir: bool,
}

#[derive(Serialize)]
pub struct CommandResult {
    stdout: String,
    stderr: String,
    code: i32,
}

#[tauri::command]
fn read_file(workspace: String, path: String) -> Result<String, String> {
    let resolved = resolve_safe_path(&workspace, &path)?;
    fs::read_to_string(&resolved).map_err(|e| format!("Failed to read file: {e}"))
}

#[tauri::command]
fn write_file(workspace: String, path: String, content: String) -> Result<(), String> {
    let resolved = resolve_safe_path(&workspace, &path)?;
    if let Some(parent) = resolved.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directories: {e}"))?;
    }
    fs::write(&resolved, content).map_err(|e| format!("Failed to write file: {e}"))
}

#[tauri::command]
fn list_directory(workspace: String, path: String) -> Result<Vec<DirEntry>, String> {
    let resolved = resolve_safe_path(&workspace, &path)?;
    let entries = fs::read_dir(&resolved).map_err(|e| format!("Failed to read directory: {e}"))?;

    let mut result = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {e}"))?;
        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to read metadata: {e}"))?;
        result.push(DirEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
        });
    }

    result.sort_by(|a, b| {
        b.is_dir.cmp(&a.is_dir).then(a.name.cmp(&b.name))
    });

    Ok(result)
}

#[tauri::command]
fn create_directory(workspace: String, path: String) -> Result<(), String> {
    let resolved = resolve_safe_path(&workspace, &path)?;
    fs::create_dir_all(&resolved).map_err(|e| format!("Failed to create directory: {e}"))
}

#[tauri::command]
fn delete_file(workspace: String, path: String) -> Result<(), String> {
    let resolved = resolve_safe_path(&workspace, &path)?;
    if resolved.is_dir() {
        fs::remove_dir_all(&resolved).map_err(|e| format!("Failed to delete directory: {e}"))
    } else {
        fs::remove_file(&resolved).map_err(|e| format!("Failed to delete file: {e}"))
    }
}

#[tauri::command]
fn run_command(workspace: String, command: String) -> Result<CommandResult, String> {
    let workspace_path = PathBuf::from(&workspace)
        .canonicalize()
        .map_err(|e| format!("Invalid workspace path: {e}"))?;

    // Run the command using the shell
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &command])
            .current_dir(&workspace_path)
            .output()
    } else {
        Command::new("sh")
            .args(["-c", &command])
            .current_dir(&workspace_path)
            .output()
    };

    match output {
        Ok(output) => Ok(CommandResult {
            stdout: String::from_utf8_lossy(&output.stdout).to_string(),
            stderr: String::from_utf8_lossy(&output.stderr).to_string(),
            code: output.status.code().unwrap_or(-1),
        }),
        Err(e) => Err(format!("Failed to execute command: {e}")),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            list_directory,
            create_directory,
            delete_file,
            run_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

