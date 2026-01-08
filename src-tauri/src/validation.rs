// ═══════════════════════════════════════════════════════════════
// BUNKER - Input Validation Module
// Security-first validation for all user inputs
// ═══════════════════════════════════════════════════════════════

use regex::Regex;
use std::sync::OnceLock;

/// Validation result with detailed error messages
#[derive(Debug)]
pub struct ValidationError {
    pub field: String,
    pub message: String,
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.field, self.message)
    }
}

impl std::error::Error for ValidationError {}

pub type ValidationResult<T> = Result<T, ValidationError>;

// ═══════════════════════════════════════════════════════════════
// SECRET NAME VALIDATION
// ═══════════════════════════════════════════════════════════════

/// Regex for valid secret names: alphanumeric, underscores, hyphens only
/// Must start with a letter or underscore
static SECRET_NAME_REGEX: OnceLock<Regex> = OnceLock::new();

fn secret_name_regex() -> &'static Regex {
    SECRET_NAME_REGEX.get_or_init(|| {
        Regex::new(r"^[A-Za-z_][A-Za-z0-9_-]{0,127}$").unwrap()
    })
}

/// Validate a secret name
/// - Must be 1-128 characters
/// - Must start with letter or underscore
/// - Can only contain: A-Z, a-z, 0-9, _, -
/// - No shell metacharacters allowed
pub fn validate_secret_name(name: &str) -> ValidationResult<&str> {
    if name.is_empty() {
        return Err(ValidationError {
            field: "name".to_string(),
            message: "Secret name cannot be empty".to_string(),
        });
    }

    if name.len() > 128 {
        return Err(ValidationError {
            field: "name".to_string(),
            message: "Secret name cannot exceed 128 characters".to_string(),
        });
    }

    if !secret_name_regex().is_match(name) {
        return Err(ValidationError {
            field: "name".to_string(),
            message: "Secret name must start with a letter or underscore and contain only alphanumeric characters, underscores, and hyphens".to_string(),
        });
    }

    // Extra safety: check for shell metacharacters explicitly
    let forbidden_chars = ['$', '`', '\\', '"', '\'', ';', '&', '|', '>', '<', '(', ')', '{', '}', '[', ']', '\n', '\r', '\0'];
    for c in forbidden_chars {
        if name.contains(c) {
            return Err(ValidationError {
                field: "name".to_string(),
                message: format!("Secret name contains forbidden character: {:?}", c),
            });
        }
    }

    Ok(name)
}

// ═══════════════════════════════════════════════════════════════
// SECRET VALUE VALIDATION
// ═══════════════════════════════════════════════════════════════

/// Validate a secret value
/// - Cannot be empty
/// - Cannot exceed 10KB
/// - Cannot contain null bytes
pub fn validate_secret_value(value: &str) -> ValidationResult<&str> {
    if value.is_empty() {
        return Err(ValidationError {
            field: "value".to_string(),
            message: "Secret value cannot be empty".to_string(),
        });
    }

    if value.len() > 10 * 1024 {
        return Err(ValidationError {
            field: "value".to_string(),
            message: "Secret value cannot exceed 10KB".to_string(),
        });
    }

    if value.contains('\0') {
        return Err(ValidationError {
            field: "value".to_string(),
            message: "Secret value cannot contain null bytes".to_string(),
        });
    }

    Ok(value)
}

// ═══════════════════════════════════════════════════════════════
// PROMPT VALIDATION (for cloud router)
// ═══════════════════════════════════════════════════════════════

/// Validate a prompt for AI models
/// - Cannot be empty
/// - Cannot exceed 100KB (reasonable limit for prompts)
/// - Cannot contain null bytes
pub fn validate_prompt(prompt: &str) -> ValidationResult<&str> {
    if prompt.trim().is_empty() {
        return Err(ValidationError {
            field: "prompt".to_string(),
            message: "Prompt cannot be empty".to_string(),
        });
    }

    if prompt.len() > 100 * 1024 {
        return Err(ValidationError {
            field: "prompt".to_string(),
            message: "Prompt cannot exceed 100KB".to_string(),
        });
    }

    if prompt.contains('\0') {
        return Err(ValidationError {
            field: "prompt".to_string(),
            message: "Prompt cannot contain null bytes".to_string(),
        });
    }

    Ok(prompt)
}

// ═══════════════════════════════════════════════════════════════
// MODEL NAME VALIDATION
// ═══════════════════════════════════════════════════════════════

/// List of allowed model identifiers
const ALLOWED_MODELS: &[&str] = &[
    // Claude models
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-3-5-sonnet-20240620",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-opus-4-20250514",
    // OpenAI models
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4-turbo-preview",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    "o1-preview",
    "o1-mini",
    // Perplexity models
    "llama-3.1-sonar-small-128k-online",
    "llama-3.1-sonar-large-128k-online",
    "llama-3.1-sonar-huge-128k-online",
    // Local Ollama models (pattern-matched)
    "llama3.1:8b",
    "llama3.1:70b",
    "llama3.1:8b-instruct-q4_0",
    "llama3.2:3b",
    "mistral:latest",
    "mistral:7b",
    "codellama:latest",
    "phi:latest",
    "qwen:latest",
    "qwen2.5:7b",
    "deepseek-coder:latest",
    "gemma:2b",
    "gemma:7b",
];

/// Regex for Ollama model names: name:tag format
static OLLAMA_MODEL_REGEX: OnceLock<Regex> = OnceLock::new();

fn ollama_model_regex() -> &'static Regex {
    OLLAMA_MODEL_REGEX.get_or_init(|| {
        Regex::new(r"^[a-z0-9][-a-z0-9.]*(?::[a-z0-9][-a-z0-9._]*)?$").unwrap()
    })
}

/// Validate a model name
/// - Must be in allowed list OR match Ollama pattern
/// - No shell metacharacters
pub fn validate_model_name(model: &str) -> ValidationResult<&str> {
    if model.is_empty() {
        return Err(ValidationError {
            field: "model".to_string(),
            message: "Model name cannot be empty".to_string(),
        });
    }

    if model.len() > 128 {
        return Err(ValidationError {
            field: "model".to_string(),
            message: "Model name cannot exceed 128 characters".to_string(),
        });
    }

    // Check if it's in allowed list
    if ALLOWED_MODELS.contains(&model) {
        return Ok(model);
    }

    // Check if it matches Ollama pattern (for local models)
    if ollama_model_regex().is_match(model) {
        return Ok(model);
    }

    Err(ValidationError {
        field: "model".to_string(),
        message: format!("Unknown or invalid model: {}", model),
    })
}

// ═══════════════════════════════════════════════════════════════
// TEMPERATURE VALIDATION
// ═══════════════════════════════════════════════════════════════

/// Validate temperature parameter
/// - Must be between 0.0 and 2.0
pub fn validate_temperature(temp: f32) -> ValidationResult<f32> {
    if temp < 0.0 || temp > 2.0 {
        return Err(ValidationError {
            field: "temperature".to_string(),
            message: "Temperature must be between 0.0 and 2.0".to_string(),
        });
    }

    if temp.is_nan() || temp.is_infinite() {
        return Err(ValidationError {
            field: "temperature".to_string(),
            message: "Temperature must be a valid number".to_string(),
        });
    }

    Ok(temp)
}

// ═══════════════════════════════════════════════════════════════
// MAX TOKENS VALIDATION
// ═══════════════════════════════════════════════════════════════

/// Validate max_tokens parameter
/// - Must be between 1 and 200000 (Claude's max)
pub fn validate_max_tokens(tokens: u32) -> ValidationResult<u32> {
    if tokens == 0 {
        return Err(ValidationError {
            field: "max_tokens".to_string(),
            message: "max_tokens must be at least 1".to_string(),
        });
    }

    if tokens > 200_000 {
        return Err(ValidationError {
            field: "max_tokens".to_string(),
            message: "max_tokens cannot exceed 200000".to_string(),
        });
    }

    Ok(tokens)
}

// ═══════════════════════════════════════════════════════════════
// COMMAND ALLOWLIST (for execute_command)
// ═══════════════════════════════════════════════════════════════

/// Allowed commands for execute_command
/// Only safe, read-only commands allowed
const ALLOWED_COMMANDS: &[&str] = &[
    "ls",
    "dir",
    "pwd",
    "whoami",
    "date",
    "hostname",
    "uname",
    "cat /etc/os-release",
    "systeminfo",
    "ver",
];

/// Check if a command is in the allowlist
/// Returns the sanitized command if allowed
pub fn validate_command(cmd: &str) -> ValidationResult<&str> {
    let cmd_trimmed = cmd.trim();

    if cmd_trimmed.is_empty() {
        return Err(ValidationError {
            field: "command".to_string(),
            message: "Command cannot be empty".to_string(),
        });
    }

    // Check exact match or prefix match with space
    for allowed in ALLOWED_COMMANDS {
        if cmd_trimmed == *allowed || cmd_trimmed.starts_with(&format!("{} ", allowed)) {
            return Ok(cmd_trimmed);
        }
    }

    Err(ValidationError {
        field: "command".to_string(),
        message: format!("Command not allowed: {}. Allowed commands: {:?}", cmd_trimmed, ALLOWED_COMMANDS),
    })
}

// ═══════════════════════════════════════════════════════════════
// SHELL ARGUMENT ESCAPING
// ═══════════════════════════════════════════════════════════════

/// Escape a value for safe use in shell single quotes
/// This is the safest way to pass arbitrary values to shell
pub fn shell_escape_single_quote(value: &str) -> String {
    // In single quotes, only single quote itself needs escaping
    // We do this by ending the single quote, adding escaped single quote, starting new single quote
    value.replace('\'', "'\\''")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_secret_name_valid() {
        assert!(validate_secret_name("MY_SECRET").is_ok());
        assert!(validate_secret_name("my_secret_123").is_ok());
        assert!(validate_secret_name("API_KEY").is_ok());
        assert!(validate_secret_name("_private").is_ok());
        assert!(validate_secret_name("secret-name").is_ok());
    }

    #[test]
    fn test_validate_secret_name_invalid() {
        assert!(validate_secret_name("").is_err());
        assert!(validate_secret_name("123start").is_err());
        assert!(validate_secret_name("has space").is_err());
        assert!(validate_secret_name("$VARIABLE").is_err());
        assert!(validate_secret_name("name;rm -rf").is_err());
        assert!(validate_secret_name("name`whoami`").is_err());
        assert!(validate_secret_name("name$(id)").is_err());
    }

    #[test]
    fn test_validate_temperature() {
        assert!(validate_temperature(0.0).is_ok());
        assert!(validate_temperature(1.0).is_ok());
        assert!(validate_temperature(2.0).is_ok());
        assert!(validate_temperature(-0.1).is_err());
        assert!(validate_temperature(2.1).is_err());
        assert!(validate_temperature(f32::NAN).is_err());
    }

    #[test]
    fn test_shell_escape() {
        assert_eq!(shell_escape_single_quote("simple"), "simple");
        assert_eq!(shell_escape_single_quote("it's"), "it'\\''s");
        assert_eq!(shell_escape_single_quote("test'value"), "test'\\''value");
    }
}
