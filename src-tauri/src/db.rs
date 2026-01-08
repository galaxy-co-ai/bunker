// DATABASE PERSISTENCE - SQLite storage for Bunker

use std::path::PathBuf;
use std::sync::OnceLock;
use parking_lot::Mutex;
use rusqlite::{Connection, Result as SqlResult, params};
use serde::{Deserialize, Serialize};
// chrono types used by TaskRecord timestamps from frontend

/// Global database connection
fn db_connection() -> &'static Mutex<Option<Connection>> {
    static DB_CONN: OnceLock<Mutex<Option<Connection>>> = OnceLock::new();
    DB_CONN.get_or_init(|| Mutex::new(None))
}

/// Get the database path in the app data directory
fn get_db_path() -> PathBuf {
    let data_dir = dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("bunker");

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&data_dir).ok();

    data_dir.join("bunker.db")
}

/// Initialize the database connection and create tables
pub fn init_db() -> SqlResult<()> {
    let path = get_db_path();
    let conn = Connection::open(&path)?;

    // Create tables
    conn.execute_batch(
        r#"
        -- Application settings
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- Operations history (extends in-memory log with persistence)
        CREATE TABLE IF NOT EXISTS operations_history (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            operation_type TEXT NOT NULL,
            target TEXT NOT NULL,
            status TEXT NOT NULL,
            details TEXT,
            duration_ms INTEGER
        );

        -- Task history for cloud router
        CREATE TABLE IF NOT EXISTS task_history (
            id TEXT PRIMARY KEY,
            prompt TEXT NOT NULL,
            provider TEXT NOT NULL,
            model TEXT,
            status TEXT NOT NULL,
            response TEXT,
            tokens_used INTEGER,
            cost_estimate REAL,
            created_at TEXT NOT NULL,
            completed_at TEXT
        );

        -- User preferences
        CREATE TABLE IF NOT EXISTS preferences (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'general'
        );

        -- Workflow configurations (for n8n integration)
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            config TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- Create indexes for common queries
        CREATE INDEX IF NOT EXISTS idx_operations_timestamp ON operations_history(timestamp);
        CREATE INDEX IF NOT EXISTS idx_tasks_created ON task_history(created_at);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON task_history(status);
        "#
    )?;

    // Store connection
    let mut db = db_connection().lock();
    *db = Some(conn);

    Ok(())
}

/// Close the database connection
pub fn close_db() {
    let mut db = db_connection().lock();
    *db = None;
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS OPERATIONS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: String,
}

/// Get a setting value
#[tauri::command]
pub fn db_get_setting(key: String) -> Option<String> {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.query_row(
            "SELECT value FROM settings WHERE key = ?1",
            params![key],
            |row| row.get(0)
        ).ok()
    } else {
        None
    }
}

/// Set a setting value
#[tauri::command]
pub fn db_set_setting(key: String, value: String) -> bool {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?1, ?2, datetime('now'))",
            params![key, value]
        ).is_ok()
    } else {
        false
    }
}

/// Get all settings
#[tauri::command]
pub fn db_get_all_settings() -> Vec<Setting> {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        let mut stmt = match conn.prepare("SELECT key, value FROM settings") {
            Ok(s) => s,
            Err(_) => return vec![],
        };

        let settings = stmt.query_map([], |row| {
            Ok(Setting {
                key: row.get(0)?,
                value: row.get(1)?,
            })
        });

        match settings {
            Ok(iter) => iter.filter_map(|r| r.ok()).collect(),
            Err(_) => vec![],
        }
    } else {
        vec![]
    }
}

// ═══════════════════════════════════════════════════════════════
// TASK HISTORY OPERATIONS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskRecord {
    pub id: String,
    pub prompt: String,
    pub provider: String,
    pub model: Option<String>,
    pub status: String,
    pub response: Option<String>,
    pub tokens_used: Option<i64>,
    pub cost_estimate: Option<f64>,
    pub created_at: String,
    pub completed_at: Option<String>,
}

/// Save a task to history
#[tauri::command]
pub fn db_save_task(task: TaskRecord) -> bool {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.execute(
            r#"INSERT INTO task_history
               (id, prompt, provider, model, status, response, tokens_used, cost_estimate, created_at, completed_at)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"#,
            params![
                task.id,
                task.prompt,
                task.provider,
                task.model,
                task.status,
                task.response,
                task.tokens_used,
                task.cost_estimate,
                task.created_at,
                task.completed_at
            ]
        ).is_ok()
    } else {
        false
    }
}

/// Update task status and response
#[tauri::command]
pub fn db_update_task(id: String, status: String, response: Option<String>, tokens: Option<i64>, cost: Option<f64>) -> bool {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.execute(
            r#"UPDATE task_history
               SET status = ?2, response = ?3, tokens_used = ?4, cost_estimate = ?5, completed_at = datetime('now')
               WHERE id = ?1"#,
            params![id, status, response, tokens, cost]
        ).is_ok()
    } else {
        false
    }
}

/// Get recent tasks
#[tauri::command]
pub fn db_get_tasks(limit: Option<i64>) -> Vec<TaskRecord> {
    let limit = limit.unwrap_or(50);
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        let mut stmt = match conn.prepare(
            "SELECT id, prompt, provider, model, status, response, tokens_used, cost_estimate, created_at, completed_at
             FROM task_history ORDER BY created_at DESC LIMIT ?1"
        ) {
            Ok(s) => s,
            Err(_) => return vec![],
        };

        let tasks = stmt.query_map(params![limit], |row| {
            Ok(TaskRecord {
                id: row.get(0)?,
                prompt: row.get(1)?,
                provider: row.get(2)?,
                model: row.get(3)?,
                status: row.get(4)?,
                response: row.get(5)?,
                tokens_used: row.get(6)?,
                cost_estimate: row.get(7)?,
                created_at: row.get(8)?,
                completed_at: row.get(9)?,
            })
        });

        match tasks {
            Ok(iter) => iter.filter_map(|r| r.ok()).collect(),
            Err(_) => vec![],
        }
    } else {
        vec![]
    }
}

// ═══════════════════════════════════════════════════════════════
// PREFERENCES OPERATIONS
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preference {
    pub key: String,
    pub value: String,
    pub category: String,
}

/// Get a preference
#[tauri::command]
pub fn db_get_preference(key: String) -> Option<String> {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.query_row(
            "SELECT value FROM preferences WHERE key = ?1",
            params![key],
            |row| row.get(0)
        ).ok()
    } else {
        None
    }
}

/// Set a preference
#[tauri::command]
pub fn db_set_preference(key: String, value: String, category: Option<String>) -> bool {
    let category = category.unwrap_or_else(|| "general".to_string());
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.execute(
            "INSERT OR REPLACE INTO preferences (key, value, category) VALUES (?1, ?2, ?3)",
            params![key, value, category]
        ).is_ok()
    } else {
        false
    }
}

/// Get preferences by category
#[tauri::command]
pub fn db_get_preferences_by_category(category: String) -> Vec<Preference> {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        let mut stmt = match conn.prepare(
            "SELECT key, value, category FROM preferences WHERE category = ?1"
        ) {
            Ok(s) => s,
            Err(_) => return vec![],
        };

        let prefs = stmt.query_map(params![category], |row| {
            Ok(Preference {
                key: row.get(0)?,
                value: row.get(1)?,
                category: row.get(2)?,
            })
        });

        match prefs {
            Ok(iter) => iter.filter_map(|r| r.ok()).collect(),
            Err(_) => vec![],
        }
    } else {
        vec![]
    }
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW OPERATIONS (for n8n integration)
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub config: String,
    pub enabled: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// Save a workflow
#[tauri::command]
pub fn db_save_workflow(workflow: Workflow) -> bool {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.execute(
            r#"INSERT OR REPLACE INTO workflows
               (id, name, description, config, enabled, created_at, updated_at)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))"#,
            params![
                workflow.id,
                workflow.name,
                workflow.description,
                workflow.config,
                workflow.enabled as i32,
                workflow.created_at
            ]
        ).is_ok()
    } else {
        false
    }
}

/// Get all workflows
#[tauri::command]
pub fn db_get_workflows() -> Vec<Workflow> {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        let mut stmt = match conn.prepare(
            "SELECT id, name, description, config, enabled, created_at, updated_at FROM workflows ORDER BY name"
        ) {
            Ok(s) => s,
            Err(_) => return vec![],
        };

        let workflows = stmt.query_map([], |row| {
            Ok(Workflow {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                config: row.get(3)?,
                enabled: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        });

        match workflows {
            Ok(iter) => iter.filter_map(|r| r.ok()).collect(),
            Err(_) => vec![],
        }
    } else {
        vec![]
    }
}

/// Delete a workflow
#[tauri::command]
pub fn db_delete_workflow(id: String) -> bool {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.execute("DELETE FROM workflows WHERE id = ?1", params![id]).is_ok()
    } else {
        false
    }
}

/// Toggle workflow enabled status
#[tauri::command]
pub fn db_toggle_workflow(id: String, enabled: bool) -> bool {
    let db = db_connection().lock();
    if let Some(ref conn) = *db {
        conn.execute(
            "UPDATE workflows SET enabled = ?2, updated_at = datetime('now') WHERE id = ?1",
            params![id, enabled as i32]
        ).is_ok()
    } else {
        false
    }
}
