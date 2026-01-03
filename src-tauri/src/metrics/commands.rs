// BUNKER Metrics Commands
// Tauri commands for metrics persistence and retrieval

use crate::error::AppError;
use crate::metrics::types::*;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use tokio::sync::RwLock;

const STORE_PATH: &str = "bunker-metrics.json";
const METRICS_FIELD: &str = "metrics";

/// Metrics manager that handles persistence
#[derive(Clone)]
pub struct MetricsManager {
    app: AppHandle,
    cache: Arc<RwLock<StoredMetrics>>,
}

impl MetricsManager {
    pub fn new(app: AppHandle) -> Self {
        Self {
            app,
            cache: Arc::new(RwLock::new(StoredMetrics::new())),
        }
    }

    /// Initialize and load metrics from store
    pub async fn init(&self) -> Result<(), AppError> {
        let store = self
            .app
            .store(STORE_PATH)
            .map_err(|e| AppError::MetricsError(e.to_string()))?;

        if let Some(stored) = store.get(METRICS_FIELD) {
            if let Ok(metrics) = serde_json::from_value::<StoredMetrics>(stored.clone()) {
                let mut cache = self.cache.write().await;
                *cache = metrics;
            }
        }

        Ok(())
    }

    /// Save an API call metric
    pub async fn save_api_call(&self, metric: ApiCallMetric) -> Result<(), AppError> {
        {
            let mut cache = self.cache.write().await;
            // Insert at the beginning for most recent first
            cache.api_calls.insert(0, metric);

            // Keep only last 1000 API calls in memory
            if cache.api_calls.len() > 1000 {
                cache.api_calls.truncate(1000);
            }
        }

        self.persist().await
    }

    /// Save a task metric
    pub async fn save_task(&self, task: TaskMetric) -> Result<(), AppError> {
        {
            let mut cache = self.cache.write().await;
            cache.tasks.insert(0, task);

            // Keep only last 500 tasks in memory
            if cache.tasks.len() > 500 {
                cache.tasks.truncate(500);
            }
        }

        self.persist().await
    }

    /// Update an existing task status
    pub async fn update_task_status(
        &self,
        task_id: &str,
        status: TaskStatus,
        duration_ms: Option<u64>,
    ) -> Result<(), AppError> {
        {
            let mut cache = self.cache.write().await;
            if let Some(task) = cache.tasks.iter_mut().find(|t| t.id == task_id) {
                task.status = status;
                if let Some(duration) = duration_ms {
                    task.duration_ms = duration;
                }
            }
        }

        self.persist().await
    }

    /// Get metrics summary for dashboard
    pub async fn get_summary(&self) -> MetricsSummary {
        let cache = self.cache.read().await;
        cache.get_summary()
    }

    /// Get recent API calls
    pub async fn get_recent_api_calls(&self, limit: usize) -> Vec<ApiCallMetric> {
        let cache = self.cache.read().await;
        cache.api_calls.iter().take(limit).cloned().collect()
    }

    /// Get recent tasks
    pub async fn get_recent_tasks(&self, limit: usize) -> Vec<TaskMetric> {
        let cache = self.cache.read().await;
        cache.tasks.iter().take(limit).cloned().collect()
    }

    /// Get active (queued or running) tasks
    pub async fn get_active_tasks(&self) -> Vec<TaskMetric> {
        let cache = self.cache.read().await;
        cache
            .tasks
            .iter()
            .filter(|t| t.status == TaskStatus::Queued || t.status == TaskStatus::Running)
            .cloned()
            .collect()
    }

    /// Clear old metrics
    pub async fn clear_old_metrics(&self, older_than_days: u32) -> Result<(), AppError> {
        {
            let mut cache = self.cache.write().await;
            cache.clear_old_metrics(older_than_days);
        }

        self.persist().await
    }

    /// Persist cache to store
    async fn persist(&self) -> Result<(), AppError> {
        let cache = self.cache.read().await;

        let store = self
            .app
            .store(STORE_PATH)
            .map_err(|e| AppError::MetricsError(e.to_string()))?;

        store.set(
            METRICS_FIELD,
            serde_json::to_value(&*cache)
                .map_err(|e| AppError::SerializationError(e.to_string()))?,
        );

        store
            .save()
            .map_err(|e| AppError::MetricsError(e.to_string()))?;

        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn metrics_save_api_call(
    metrics: tauri::State<'_, MetricsManager>,
    metric: ApiCallMetric,
) -> Result<(), AppError> {
    metrics.save_api_call(metric).await
}

#[tauri::command]
pub async fn metrics_save_task(
    metrics: tauri::State<'_, MetricsManager>,
    task: TaskMetric,
) -> Result<(), AppError> {
    metrics.save_task(task).await
}

#[tauri::command]
pub async fn metrics_update_task_status(
    metrics: tauri::State<'_, MetricsManager>,
    task_id: String,
    status: TaskStatus,
    duration_ms: Option<u64>,
) -> Result<(), AppError> {
    metrics.update_task_status(&task_id, status, duration_ms).await
}

#[tauri::command]
pub async fn metrics_get_summary(
    metrics: tauri::State<'_, MetricsManager>,
) -> Result<MetricsSummary, AppError> {
    Ok(metrics.get_summary().await)
}

#[tauri::command]
pub async fn metrics_get_recent_api_calls(
    metrics: tauri::State<'_, MetricsManager>,
    limit: Option<usize>,
) -> Result<Vec<ApiCallMetric>, AppError> {
    Ok(metrics.get_recent_api_calls(limit.unwrap_or(50)).await)
}

#[tauri::command]
pub async fn metrics_get_recent_tasks(
    metrics: tauri::State<'_, MetricsManager>,
    limit: Option<usize>,
) -> Result<Vec<TaskMetric>, AppError> {
    Ok(metrics.get_recent_tasks(limit.unwrap_or(50)).await)
}

#[tauri::command]
pub async fn metrics_get_active_tasks(
    metrics: tauri::State<'_, MetricsManager>,
) -> Result<Vec<TaskMetric>, AppError> {
    Ok(metrics.get_active_tasks().await)
}

#[tauri::command]
pub async fn metrics_clear_old(
    metrics: tauri::State<'_, MetricsManager>,
    older_than_days: Option<u32>,
) -> Result<(), AppError> {
    metrics.clear_old_metrics(older_than_days.unwrap_or(30)).await
}
