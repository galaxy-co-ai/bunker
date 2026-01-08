// ═══════════════════════════════════════════════════════════════
// BUNKER - Shell Security Module
// Command sanitization and validation for PTY operations
// ═══════════════════════════════════════════════════════════════

use std::fmt;
use log::{warn, info};

/// Security error types for shell operations
#[derive(Debug, Clone)]
pub enum SecurityError {
    /// Command contains dangerous metacharacters
    DangerousMetacharacters(String),
    /// Command attempts path traversal
    PathTraversal,
    /// Command not in allowlist
    CommandNotAllowed(String),
    /// Input too long
    InputTooLong { max: usize, actual: usize },
    /// Input is empty
    EmptyInput,
    /// Invalid control sequence
    InvalidControlSequence,
}

impl fmt::Display for SecurityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SecurityError::DangerousMetacharacters(chars) => {
                write!(f, "Input contains dangerous characters: {}", chars)
            }
            SecurityError::PathTraversal => {
                write!(f, "Path traversal attempt detected")
            }
            SecurityError::CommandNotAllowed(cmd) => {
                write!(f, "Command not allowed: {}", cmd)
            }
            SecurityError::InputTooLong { max, actual } => {
                write!(f, "Input too long: {} bytes (max: {})", actual, max)
            }
            SecurityError::EmptyInput => {
                write!(f, "Input cannot be empty")
            }
            SecurityError::InvalidControlSequence => {
                write!(f, "Invalid or dangerous control sequence")
            }
        }
    }
}

impl std::error::Error for SecurityError {}

/// Result type for security operations
pub type SecurityResult<T> = Result<T, SecurityError>;

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

/// Maximum length for PTY input data
pub const MAX_PTY_INPUT_LENGTH: usize = 4096;

/// Shell metacharacters that could be used for injection
/// Note: For an interactive PTY, we're more permissive since the user
/// is essentially typing into a shell. We mainly protect against
/// programmatic injection attacks.
const DANGEROUS_SEQUENCES: &[&str] = &[
    // Command chaining that might bypass intended commands
    "$(", // Command substitution
    "`",  // Backtick command substitution
    // Null bytes that could truncate strings
    "\0",
];

/// Sequences that indicate potential scripted attacks
const ATTACK_PATTERNS: &[&str] = &[
    // Common attack patterns
    "/etc/passwd",
    "/etc/shadow",
    "rm -rf /",
    "rm -rf ~",
    "mkfs.",
    "dd if=/dev/",
    ":(){:|:&};:", // Fork bomb
    "chmod -R 777",
    "wget http",
    "curl http",
    // Windows-specific dangerous commands
    "format c:",
    "del /f /s /q",
    "rd /s /q",
    // Base64 encoded commands (potential obfuscation)
    "| base64 -d",
    "| base64 --decode",
];

/// Allowed interactive commands (for logging/audit purposes)
/// These are common safe commands that we expect in normal usage
const SAFE_COMMAND_PREFIXES: &[&str] = &[
    "ls", "dir", "cd", "pwd", "echo", "cat", "type", "more", "less",
    "head", "tail", "grep", "find", "where", "which", "whoami",
    "date", "time", "hostname", "uname", "clear", "cls", "history",
    "git", "npm", "node", "python", "cargo", "rustc", "code",
    "mkdir", "touch", "cp", "mv", "rm", "del", "copy", "move",
    "set", "export", "env", "printenv", "Get-", "Set-",
];

// ═══════════════════════════════════════════════════════════════
// SANITIZATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/// Sanitize input data before writing to PTY
///
/// For an interactive terminal, we allow most input but:
/// 1. Enforce length limits to prevent buffer issues
/// 2. Block null bytes that could cause issues
/// 3. Log potentially dangerous patterns for audit
/// 4. Block known attack patterns
pub fn sanitize_pty_input(input: &str) -> SecurityResult<String> {
    // Check for empty input (but allow whitespace for formatting)
    if input.is_empty() {
        return Err(SecurityError::EmptyInput);
    }

    // Enforce length limit
    if input.len() > MAX_PTY_INPUT_LENGTH {
        warn!(
            "PTY input rejected: too long ({} bytes, max {})",
            input.len(),
            MAX_PTY_INPUT_LENGTH
        );
        return Err(SecurityError::InputTooLong {
            max: MAX_PTY_INPUT_LENGTH,
            actual: input.len(),
        });
    }

    // Block null bytes
    if input.contains('\0') {
        warn!("PTY input rejected: contains null bytes");
        return Err(SecurityError::DangerousMetacharacters("\\0".to_string()));
    }

    // Check for known attack patterns
    let input_lower = input.to_lowercase();
    for pattern in ATTACK_PATTERNS {
        if input_lower.contains(&pattern.to_lowercase()) {
            warn!("PTY input rejected: matches attack pattern '{}'", pattern);
            return Err(SecurityError::CommandNotAllowed(pattern.to_string()));
        }
    }

    // Check for dangerous sequences that could indicate injection
    for seq in DANGEROUS_SEQUENCES {
        if input.contains(seq) {
            // Log but allow - these might be legitimate in some contexts
            // For strict mode, you could reject here
            info!("PTY input contains potentially dangerous sequence: {:?}", seq);
        }
    }

    // Check for path traversal attempts in what looks like file paths
    if contains_path_traversal(input) {
        warn!("PTY input rejected: path traversal attempt detected");
        return Err(SecurityError::PathTraversal);
    }

    // Log command for audit if it matches a recognizable pattern
    log_command_audit(input);

    Ok(input.to_string())
}

/// Check if input contains path traversal attempts
fn contains_path_traversal(input: &str) -> bool {
    // Look for path traversal patterns
    let traversal_patterns = [
        "../../../",     // Deep traversal
        "..\\..\\..\\",  // Windows deep traversal
        "/etc/",         // Unix system directories
        "/root/",
        "/var/",
        "C:\\Windows\\", // Windows system directories
        "C:\\System32\\",
    ];

    let input_normalized = input.replace('\\', "/");

    for pattern in traversal_patterns {
        let pattern_normalized = pattern.replace('\\', "/");
        if input_normalized.contains(&pattern_normalized) {
            return true;
        }
    }

    false
}

/// Log command for security audit
fn log_command_audit(input: &str) {
    // Only log if it looks like a command (starts with known prefix)
    let trimmed = input.trim();

    // Skip logging for single characters (typing), control sequences, etc.
    if trimmed.len() < 2 || trimmed.starts_with('\x1b') {
        return;
    }

    // Check if it's a recognized command
    let first_word = trimmed.split_whitespace().next().unwrap_or("");
    let is_known = SAFE_COMMAND_PREFIXES
        .iter()
        .any(|prefix| first_word.eq_ignore_ascii_case(prefix));

    if is_known {
        info!("PTY command: {}", truncate_for_log(trimmed, 100));
    } else if trimmed.contains(' ') {
        // Unknown multi-word command - might be worth noting
        info!("PTY unknown command: {}", truncate_for_log(trimmed, 50));
    }
}

/// Truncate string for logging
fn truncate_for_log(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}

/// Validate control sequences (for pty_signal)
/// Ensures only valid terminal control characters are sent
pub fn validate_control_sequence(byte: u8) -> SecurityResult<u8> {
    match byte {
        0x03 => Ok(byte), // ETX - Ctrl+C (SIGINT)
        0x04 => Ok(byte), // EOT - Ctrl+D (EOF)
        0x1A => Ok(byte), // SUB - Ctrl+Z (SIGTSTP)
        0x0D => Ok(byte), // CR - Enter
        0x0A => Ok(byte), // LF - Newline
        0x08 => Ok(byte), // BS - Backspace
        0x7F => Ok(byte), // DEL - Delete
        0x09 => Ok(byte), // HT - Tab
        0x1B => Ok(byte), // ESC - Escape (for escape sequences)
        _ if byte >= 0x20 && byte < 0x7F => Ok(byte), // Printable ASCII
        _ if byte >= 0x80 => Ok(byte), // UTF-8 continuation bytes
        _ => {
            warn!("Invalid control sequence rejected: 0x{:02X}", byte);
            Err(SecurityError::InvalidControlSequence)
        }
    }
}

/// Check if a command is in the allowlist (for non-PTY command execution)
/// This is stricter than PTY sanitization since it's for programmatic commands
pub fn is_command_allowed(cmd: &str) -> bool {
    let cmd_trimmed = cmd.trim();
    let first_word = cmd_trimmed.split_whitespace().next().unwrap_or("");

    SAFE_COMMAND_PREFIXES
        .iter()
        .any(|prefix| first_word.eq_ignore_ascii_case(prefix))
}

/// Validate command arguments for shell safety
pub fn validate_arguments(args: &[&str]) -> SecurityResult<()> {
    for arg in args {
        // Check length
        if arg.len() > 1024 {
            return Err(SecurityError::InputTooLong {
                max: 1024,
                actual: arg.len(),
            });
        }

        // Check for null bytes
        if arg.contains('\0') {
            return Err(SecurityError::DangerousMetacharacters("\\0".to_string()));
        }

        // Check for dangerous sequences
        for seq in DANGEROUS_SEQUENCES {
            if arg.contains(seq) {
                return Err(SecurityError::DangerousMetacharacters(seq.to_string()));
            }
        }
    }

    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_normal_input() {
        assert!(sanitize_pty_input("ls -la").is_ok());
        assert!(sanitize_pty_input("cd /home/user").is_ok());
        assert!(sanitize_pty_input("echo hello world").is_ok());
        assert!(sanitize_pty_input("git status").is_ok());
    }

    #[test]
    fn test_sanitize_rejects_empty() {
        assert!(matches!(
            sanitize_pty_input(""),
            Err(SecurityError::EmptyInput)
        ));
    }

    #[test]
    fn test_sanitize_rejects_null_bytes() {
        assert!(matches!(
            sanitize_pty_input("hello\0world"),
            Err(SecurityError::DangerousMetacharacters(_))
        ));
    }

    #[test]
    fn test_sanitize_rejects_too_long() {
        let long_input = "a".repeat(MAX_PTY_INPUT_LENGTH + 1);
        assert!(matches!(
            sanitize_pty_input(&long_input),
            Err(SecurityError::InputTooLong { .. })
        ));
    }

    #[test]
    fn test_sanitize_rejects_attack_patterns() {
        assert!(sanitize_pty_input("cat /etc/passwd").is_err());
        assert!(sanitize_pty_input("rm -rf /").is_err());
        assert!(sanitize_pty_input(":(){:|:&};:").is_err()); // Fork bomb
    }

    #[test]
    fn test_path_traversal_detection() {
        assert!(contains_path_traversal("../../../etc/passwd"));
        assert!(contains_path_traversal("..\\..\\..\\Windows\\System32"));
        assert!(!contains_path_traversal("./relative/path"));
        assert!(!contains_path_traversal("normal/path"));
    }

    #[test]
    fn test_valid_control_sequences() {
        assert!(validate_control_sequence(0x03).is_ok()); // Ctrl+C
        assert!(validate_control_sequence(0x04).is_ok()); // Ctrl+D
        assert!(validate_control_sequence(0x1A).is_ok()); // Ctrl+Z
        assert!(validate_control_sequence(0x0D).is_ok()); // Enter
    }

    #[test]
    fn test_command_allowlist() {
        assert!(is_command_allowed("ls -la"));
        assert!(is_command_allowed("git status"));
        assert!(is_command_allowed("npm install"));
        // Unknown commands return false but don't error
        assert!(!is_command_allowed("unknown_command"));
    }

    #[test]
    fn test_validate_arguments() {
        assert!(validate_arguments(&["arg1", "arg2"]).is_ok());
        assert!(validate_arguments(&["--flag", "value"]).is_ok());

        // Null byte in argument
        assert!(validate_arguments(&["arg\0bad"]).is_err());

        // Command substitution attempt
        assert!(validate_arguments(&["$(whoami)"]).is_err());
    }
}
