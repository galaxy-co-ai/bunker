// OPERATIONS LOG - Real operation tracking

use std::sync::{Arc, OnceLock};
use serde::{Deserialize, Serialize};
use parking_lot::Mutex;
use chrono::{DateTime, Utc};

use crate::pty::PtyResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub operation_type: String,
    pub target: String,
    pub status: String,
    pub details: Option<String>,
    pub duration_ms: Option<u64>,
}

/// Get the operations log singleton
fn operations_log() -> &'static Arc<Mutex<Vec<Operation>>> {
    static OPERATIONS_LOG: OnceLock<Arc<Mutex<Vec<Operation>>>> = OnceLock::new();
    OPERATIONS_LOG.get_or_init(|| Arc::new(Mutex::new(Vec::new())))
}

/// Log an operation (internal use)
#[allow(dead_code)]
pub fn log_operation(op_type: &str, target: &str, status: &str, details: Option<String>, duration_ms: Option<u64>) {
    let mut log = operations_log().lock();
    let op = Operation {
        id: format!("op-{}", Utc::now().timestamp_millis()),
        timestamp: Utc::now(),
        operation_type: op_type.to_string(),
        target: target.to_string(),
        status: status.to_string(),
        details,
        duration_ms,
    };
    log.push(op);

    // Keep only last 500 operations
    if log.len() > 500 {
        log.remove(0);
    }
}

/// Get operations log
#[tauri::command]
pub fn get_operations_log(limit: Option<usize>) -> Vec<Operation> {
    let log = operations_log().lock();
    let limit = limit.unwrap_or(100);
    log.iter().rev().take(limit).cloned().collect()
}

/// Clear operations log
#[tauri::command]
pub fn clear_operations_log() -> PtyResult {
    let mut log = operations_log().lock();
    log.clear();
    PtyResult {
        success: true,
        message: "Operations log cleared".to_string(),
    }
}

/// Add an operation entry (can be called from frontend)
#[tauri::command]
pub fn add_operation(op_type: String, target: String, status: String, details: Option<String>) {
    log_operation(&op_type, &target, &status, details, None);
}
