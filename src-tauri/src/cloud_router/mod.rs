// Cloud Router Module
// Smart routing of tasks to Claude, ChatGPT, and Perplexity APIs

pub mod types;
pub mod classifier;
pub mod clients;
pub mod commands;
pub mod browser;

// Re-export commonly used types
pub use types::*;
pub use classifier::classify_task;
pub use commands::*;
pub use browser::{is_browser_mode_available, get_browser_client, BrowserWorkerStatus};
