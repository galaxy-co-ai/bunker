// BUNKER Error Types
// Unified error handling across all modules

use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("API key not found: {0}")]
    MissingApiKey(String),

    #[error("API key storage error: {0}")]
    KeyringError(String),

    #[error("Claude API error: {0}")]
    ClaudeApiError(String),

    #[error("HTTP request failed: {0}")]
    HttpError(String),

    #[error("Terminal error: {0}")]
    TerminalError(String),

    #[error("PTY session not found: {0}")]
    SessionNotFound(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),

    #[error("IO error: {0}")]
    IoError(String),

    #[error("Metrics error: {0}")]
    MetricsError(String),
}

// Convert reqwest errors
impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::HttpError(err.to_string())
    }
}

// Convert IO errors
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::IoError(err.to_string())
    }
}

// Convert serde_json errors
impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::SerializationError(err.to_string())
    }
}

// Result type alias for convenience
pub type AppResult<T> = Result<T, AppError>;
