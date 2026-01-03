// BUNKER Metrics Types
// Data structures for API call and task tracking

use serde::{Deserialize, Serialize};

/// Provider for API calls
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ApiProvider {
    Claude,
    OpenAI,
    Perplexity,
    Gemini,
}

/// Status of a task
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TaskStatus {
    Queued,
    Running,
    Success,
    Failed,
}

/// Record of an API call for metrics tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiCallMetric {
    pub id: String,
    pub timestamp: i64, // Unix timestamp in milliseconds
    pub provider: ApiProvider,
    pub model: String,
    pub input_tokens: u32,
    pub output_tokens: u32,
    pub cost: f64,
    pub response_time_ms: u64,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub conversation_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub agent_id: Option<String>,
}

/// Record of a task execution
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskMetric {
    pub id: String,
    pub timestamp: i64,
    #[serde(rename = "type")]
    pub task_type: String,
    pub status: TaskStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub agent_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    pub duration_ms: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logs: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<serde_json::Value>,
}

/// Summary of costs over time periods
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CostSummary {
    pub today: f64,
    pub week: f64,
    pub month: f64,
    pub all_time: f64,
}

/// Summary of token usage
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TokenSummary {
    pub input: u64,
    pub output: u64,
    pub total: u64,
}

/// Full metrics summary for dashboard
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetricsSummary {
    pub cost_summary: CostSummary,
    pub token_summary: TokenSummary,
    pub total_api_calls: usize,
    pub total_tasks: usize,
    pub active_tasks: usize,
    pub success_rate: f64,
}

/// Stored metrics data
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StoredMetrics {
    pub api_calls: Vec<ApiCallMetric>,
    pub tasks: Vec<TaskMetric>,
}

impl StoredMetrics {
    pub fn new() -> Self {
        Self::default()
    }

    /// Calculate cost summary from stored API calls
    pub fn calculate_cost_summary(&self) -> CostSummary {
        use chrono::{Datelike, Local, TimeZone};

        let now = Local::now();
        let start_of_today = Local
            .with_ymd_and_hms(now.year(), now.month(), now.day(), 0, 0, 0)
            .unwrap()
            .timestamp_millis();

        // Calculate start of week (Sunday)
        let days_since_sunday = now.weekday().num_days_from_sunday() as i64;
        let start_of_week = start_of_today - (days_since_sunday * 24 * 60 * 60 * 1000);

        // Calculate start of month
        let start_of_month = Local
            .with_ymd_and_hms(now.year(), now.month(), 1, 0, 0, 0)
            .unwrap()
            .timestamp_millis();

        let mut today = 0.0;
        let mut week = 0.0;
        let mut month = 0.0;
        let mut all_time = 0.0;

        for call in &self.api_calls {
            all_time += call.cost;
            if call.timestamp >= start_of_month {
                month += call.cost;
            }
            if call.timestamp >= start_of_week {
                week += call.cost;
            }
            if call.timestamp >= start_of_today {
                today += call.cost;
            }
        }

        CostSummary {
            today: (today * 10000.0).round() / 10000.0,
            week: (week * 10000.0).round() / 10000.0,
            month: (month * 10000.0).round() / 10000.0,
            all_time: (all_time * 10000.0).round() / 10000.0,
        }
    }

    /// Calculate token summary from stored API calls
    pub fn calculate_token_summary(&self) -> TokenSummary {
        let mut input: u64 = 0;
        let mut output: u64 = 0;

        for call in &self.api_calls {
            input += call.input_tokens as u64;
            output += call.output_tokens as u64;
        }

        TokenSummary {
            input,
            output,
            total: input + output,
        }
    }

    /// Get full metrics summary
    pub fn get_summary(&self) -> MetricsSummary {
        let active_tasks = self
            .tasks
            .iter()
            .filter(|t| t.status == TaskStatus::Queued || t.status == TaskStatus::Running)
            .count();

        let successful = self
            .api_calls
            .iter()
            .filter(|c| c.success)
            .count();

        let success_rate = if self.api_calls.is_empty() {
            100.0
        } else {
            (successful as f64 / self.api_calls.len() as f64) * 100.0
        };

        MetricsSummary {
            cost_summary: self.calculate_cost_summary(),
            token_summary: self.calculate_token_summary(),
            total_api_calls: self.api_calls.len(),
            total_tasks: self.tasks.len(),
            active_tasks,
            success_rate: (success_rate * 100.0).round() / 100.0,
        }
    }

    /// Clear metrics older than a given number of days
    pub fn clear_old_metrics(&mut self, older_than_days: u32) {
        let cutoff = chrono::Local::now().timestamp_millis()
            - (older_than_days as i64 * 24 * 60 * 60 * 1000);

        self.api_calls.retain(|c| c.timestamp >= cutoff);
        self.tasks.retain(|t| t.timestamp >= cutoff);
    }
}
