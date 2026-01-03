// BUNKER Tool System
// Provides tools for Claude agents to interact with the system

pub mod commands;
pub mod file_ops;
pub mod registry;
pub mod terminal;
pub mod types;

// Re-export commands for Tauri
pub use commands::*;
pub use registry::ToolRegistry;
pub use types::ToolContext;
