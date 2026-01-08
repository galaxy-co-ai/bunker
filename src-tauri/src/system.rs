// SYSTEM MONITORING COMMANDS - Console page system info

use std::process::Command;
use serde::{Deserialize, Serialize};
use sysinfo::{System, Disks, CpuRefreshKind, RefreshKind, ProcessRefreshKind};

use crate::validation;

// Windows path for Git Bash
const GIT_BASH: &str = "C:/Program Files/Git/bin/bash.exe";

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub hostname: String,
    pub cpu_count: usize,
    pub cpu_brand: String,
    pub total_memory: u64,
    pub kernel_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub used_space: u64,
    pub usage_percent: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub memory_used: u64,
    pub memory_total: u64,
    pub memory_percent: f32,
    pub disks: Vec<DiskInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_mb: u64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

/// Get static system information
#[tauri::command]
pub fn get_system_info() -> SystemInfo {
    let sys = System::new_all();

    SystemInfo {
        os_name: System::name().unwrap_or_else(|| "Unknown".to_string()),
        os_version: System::os_version().unwrap_or_else(|| "Unknown".to_string()),
        hostname: System::host_name().unwrap_or_else(|| "Unknown".to_string()),
        cpu_count: sys.cpus().len(),
        cpu_brand: sys.cpus().first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Unknown".to_string()),
        total_memory: sys.total_memory() / 1024 / 1024, // Convert to MB
        kernel_version: System::kernel_version().unwrap_or_else(|| "Unknown".to_string()),
    }
}

/// Get current system metrics (CPU, RAM, Disk usage)
#[tauri::command]
pub fn get_system_metrics() -> SystemMetrics {
    let mut sys = System::new();

    // Refresh CPU (reduced delay for better responsiveness)
    sys.refresh_specifics(RefreshKind::new().with_cpu(CpuRefreshKind::everything()));
    std::thread::sleep(std::time::Duration::from_millis(50));
    sys.refresh_specifics(RefreshKind::new().with_cpu(CpuRefreshKind::everything()));

    // Refresh memory
    sys.refresh_memory();

    // Get disk info
    let disks = Disks::new_with_refreshed_list();
    let disk_info: Vec<DiskInfo> = disks.iter().map(|disk| {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total - available;
        DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            total_space: total / 1024 / 1024 / 1024, // GB
            available_space: available / 1024 / 1024 / 1024, // GB
            used_space: used / 1024 / 1024 / 1024, // GB
            usage_percent: if total > 0 { (used as f32 / total as f32) * 100.0 } else { 0.0 },
        }
    }).collect();

    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let memory_used = sys.used_memory() / 1024 / 1024; // MB
    let memory_total = sys.total_memory() / 1024 / 1024; // MB
    let memory_percent = if memory_total > 0 { (memory_used as f32 / memory_total as f32) * 100.0 } else { 0.0 };

    SystemMetrics {
        cpu_usage,
        memory_used,
        memory_total,
        memory_percent,
        disks: disk_info,
    }
}

/// Get list of running processes (top by CPU/memory)
#[tauri::command]
pub fn get_process_list() -> Vec<ProcessInfo> {
    let mut sys = System::new();
    sys.refresh_specifics(
        RefreshKind::new()
            .with_processes(ProcessRefreshKind::everything())
            .with_cpu(CpuRefreshKind::everything())
    );

    // Reduced delay for better responsiveness
    std::thread::sleep(std::time::Duration::from_millis(50));
    sys.refresh_specifics(
        RefreshKind::new()
            .with_processes(ProcessRefreshKind::everything())
            .with_cpu(CpuRefreshKind::everything())
    );

    let mut processes: Vec<ProcessInfo> = sys.processes()
        .iter()
        .map(|(pid, process)| {
            ProcessInfo {
                pid: pid.as_u32(),
                name: process.name().to_string(),
                cpu_usage: process.cpu_usage(),
                memory_mb: process.memory() / 1024 / 1024,
                status: format!("{:?}", process.status()),
            }
        })
        .collect();

    // Sort by CPU usage descending, take top 50
    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap_or(std::cmp::Ordering::Equal));
    processes.truncate(50);

    processes
}

/// Result for n8n start operation
#[derive(Debug, Serialize, Deserialize)]
pub struct N8nStartResult {
    pub success: bool,
    pub message: String,
    pub already_running: bool,
}

/// Check if n8n is already running by checking port 5678
fn is_n8n_running() -> bool {
    use std::net::TcpStream;
    TcpStream::connect("127.0.0.1:5678").is_ok()
}

/// Start n8n as a background process
#[tauri::command]
pub fn start_n8n() -> N8nStartResult {
    // Check if already running
    if is_n8n_running() {
        return N8nStartResult {
            success: true,
            message: "n8n is already running on port 5678".to_string(),
            already_running: true,
        };
    }

    // Start n8n using npx - hidden window on Windows
    #[cfg(windows)]
    let result = {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        Command::new("cmd")
            .args(["/C", "npx", "n8n", "start"])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
    };

    #[cfg(not(windows))]
    let result = Command::new("sh")
        .args(["-c", "npx n8n start &"])
        .spawn();

    match result {
        Ok(_) => N8nStartResult {
            success: true,
            message: "n8n starting in background...".to_string(),
            already_running: false,
        },
        Err(e) => N8nStartResult {
            success: false,
            message: format!("Failed to start n8n: {}", e),
            already_running: false,
        },
    }
}

/// Execute a shell command (for terminal) - RESTRICTED to safe commands only
/// Only allows read-only, informational commands from an allowlist
#[tauri::command]
pub fn execute_command(cmd: String) -> CommandResult {
    // Validate command against allowlist
    if let Err(e) = validation::validate_command(&cmd) {
        return CommandResult {
            success: false,
            stdout: String::new(),
            stderr: format!("Command not allowed: {}. Use the PTY terminal for interactive commands.", e),
            exit_code: None,
        };
    }

    let output = Command::new(GIT_BASH)
        .args(["-c", &cmd])
        .output();

    match output {
        Ok(result) => CommandResult {
            success: result.status.success(),
            stdout: String::from_utf8_lossy(&result.stdout).to_string(),
            stderr: String::from_utf8_lossy(&result.stderr).to_string(),
            exit_code: result.status.code(),
        },
        Err(e) => CommandResult {
            success: false,
            stdout: String::new(),
            stderr: format!("Failed to execute command: {}", e),
            exit_code: None,
        },
    }
}
