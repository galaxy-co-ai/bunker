// VAULT COMMANDS - Interface with GalaxyCo encrypted vault

use std::process::Command;
use serde::{Deserialize, Serialize};

use crate::validation::{validate_secret_name, validate_secret_value};

// Windows path to vault script (Git Bash compatible)
const VAULT_PATH: &str = "C:/Users/Owner/workspace/bunker/.bunker-secrets/vault";
const GIT_BASH: &str = "C:/Program Files/Git/bin/bash.exe";

#[derive(Debug, Serialize, Deserialize)]
pub struct Secret {
    pub name: String,
    pub value: Option<String>,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VaultResult {
    pub success: bool,
    pub message: String,
    pub data: Option<Vec<Secret>>,
}

/// Determine category based on secret name
fn categorize_secret(name: &str) -> String {
    let name_upper = name.to_uppercase();

    if name_upper.contains("OPENAI") || name_upper.contains("ANTHROPIC") ||
       name_upper.contains("CLAUDE") || name_upper.contains("GEMINI") ||
       name_upper.contains("GOOGLE_AI") || name_upper.contains("GOOGLE_GENERATIVE") ||
       name_upper.contains("OLLAMA") || name_upper.contains("PERPLEXITY") ||
       name_upper.contains("GROQ") || name_upper.contains("MISTRAL") {
        "AI Services".to_string()
    } else if name_upper.contains("DATABASE") || name_upper.contains("DB_") ||
              name_upper.contains("POSTGRES") || name_upper.contains("MYSQL") ||
              name_upper.contains("MONGO") || name_upper.contains("REDIS") ||
              name_upper.contains("SUPABASE") {
        "Database".to_string()
    } else if name_upper.contains("CLERK") || name_upper.contains("AUTH") ||
              name_upper.contains("JWT") || name_upper.contains("SESSION") ||
              name_upper.contains("NEXTAUTH") || name_upper.contains("AUTH0") {
        "Authentication".to_string()
    } else if name_upper.contains("N8N") || name_upper.contains("WEBHOOK") ||
              name_upper.contains("ZAPIER") || name_upper.contains("MAKE") {
        "Automation".to_string()
    } else if name_upper.contains("SENTRY") || name_upper.contains("DATADOG") ||
              name_upper.contains("LOGTAIL") || name_upper.contains("AXIOM") {
        "Monitoring".to_string()
    } else if name_upper.contains("STRIPE") || name_upper.contains("PAYMENT") ||
              name_upper.contains("PAYPAL") || name_upper.contains("BILLING") {
        "Payments".to_string()
    } else if name_upper.contains("AWS") || name_upper.contains("AZURE") ||
              name_upper.contains("GCP") || name_upper.contains("VERCEL") ||
              name_upper.contains("CLOUDFLARE") || name_upper.contains("S3") {
        "Cloud Services".to_string()
    } else if name_upper.contains("GITHUB") || name_upper.contains("GITLAB") ||
              name_upper.contains("BITBUCKET") {
        "Version Control".to_string()
    } else if name_upper.contains("APOLLO") || name_upper.contains("LEAD") ||
              name_upper.contains("CRM") || name_upper.contains("HUBSPOT") ||
              name_upper.contains("SALESFORCE") {
        "Sales & CRM".to_string()
    } else if name_upper.contains("ENCRYPTION") || name_upper.contains("SECRET") ||
              name_upper.contains("KEY") && !name_upper.contains("API") {
        "Security".to_string()
    } else {
        "Other".to_string()
    }
}

/// List all secret names from the vault
#[tauri::command]
pub fn vault_list() -> VaultResult {
    let output = Command::new(GIT_BASH)
        .args(["-c", &format!("{} list", VAULT_PATH)])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let stdout = String::from_utf8_lossy(&result.stdout);
                let secrets: Vec<Secret> = stdout
                    .lines()
                    .filter(|line| !line.is_empty())
                    .map(|name| Secret {
                        name: name.to_string(),
                        value: None,
                        category: categorize_secret(name),
                    })
                    .collect();

                VaultResult {
                    success: true,
                    message: format!("Found {} secrets", secrets.len()),
                    data: Some(secrets),
                }
            } else {
                VaultResult {
                    success: false,
                    message: String::from_utf8_lossy(&result.stderr).to_string(),
                    data: None,
                }
            }
        }
        Err(e) => VaultResult {
            success: false,
            message: format!("Failed to execute vault: {}", e),
            data: None,
        },
    }
}

/// Get a specific secret value
#[tauri::command]
pub fn vault_get(name: String) -> VaultResult {
    // Validate the secret name to prevent command injection
    if let Err(e) = validate_secret_name(&name) {
        return VaultResult {
            success: false,
            message: format!("Invalid secret name: {}", e),
            data: None,
        };
    }

    // Use environment variable to safely pass the name
    let output = Command::new(GIT_BASH)
        .env("VAULT_SECRET_NAME", &name)
        .args(["-c", &format!("{} get \"$VAULT_SECRET_NAME\"", VAULT_PATH)])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let value = String::from_utf8_lossy(&result.stdout).trim().to_string();
                VaultResult {
                    success: true,
                    message: "Secret retrieved".to_string(),
                    data: Some(vec![Secret {
                        name: name.clone(),
                        value: Some(value),
                        category: categorize_secret(&name),
                    }]),
                }
            } else {
                VaultResult {
                    success: false,
                    message: format!("Secret not found: {}", name),
                    data: None,
                }
            }
        }
        Err(e) => VaultResult {
            success: false,
            message: format!("Failed to get secret: {}", e),
            data: None,
        },
    }
}

/// Add or update a secret
#[tauri::command]
pub fn vault_add(name: String, value: String) -> VaultResult {
    // Validate the secret name to prevent command injection
    if let Err(e) = validate_secret_name(&name) {
        return VaultResult {
            success: false,
            message: format!("Invalid secret name: {}", e),
            data: None,
        };
    }

    // Validate the secret value
    if let Err(e) = validate_secret_value(&value) {
        return VaultResult {
            success: false,
            message: format!("Invalid secret value: {}", e),
            data: None,
        };
    }

    // Use environment variables to safely pass name and value
    let output = Command::new(GIT_BASH)
        .env("VAULT_SECRET_NAME", &name)
        .env("VAULT_SECRET_VALUE", &value)
        .args(["-c", &format!("{} add \"$VAULT_SECRET_NAME\" \"$VAULT_SECRET_VALUE\"", VAULT_PATH)])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                VaultResult {
                    success: true,
                    message: format!("Secret '{}' saved", name),
                    data: None,
                }
            } else {
                VaultResult {
                    success: false,
                    message: String::from_utf8_lossy(&result.stderr).to_string(),
                    data: None,
                }
            }
        }
        Err(e) => VaultResult {
            success: false,
            message: format!("Failed to add secret: {}", e),
            data: None,
        },
    }
}

/// Delete a secret (export, filter, re-import)
#[tauri::command]
pub fn vault_delete(name: String) -> VaultResult {
    // Validate the secret name to prevent command injection
    if let Err(e) = validate_secret_name(&name) {
        return VaultResult {
            success: false,
            message: format!("Invalid secret name: {}", e),
            data: None,
        };
    }

    // Use environment variable to safely pass the name
    // The script reads from VAULT_DELETE_NAME env var
    let script = format!(
        r#"
        VAULT="{vault_path}"
        DELETE_NAME="$VAULT_DELETE_NAME"
        TEMP_FILE=$(mktemp)
        $VAULT export | grep -v "^$DELETE_NAME=" > "$TEMP_FILE"
        rm -f ~/.bunker-secrets/credentials.gpg
        while IFS='=' read -r key value; do
            $VAULT add "$key" "$value"
        done < "$TEMP_FILE"
        rm "$TEMP_FILE"
        "#,
        vault_path = VAULT_PATH
    );

    let output = Command::new(GIT_BASH)
        .env("VAULT_DELETE_NAME", &name)
        .args(["-c", &script])
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                VaultResult {
                    success: true,
                    message: format!("Secret '{}' deleted", name),
                    data: None,
                }
            } else {
                VaultResult {
                    success: false,
                    message: "Failed to delete secret".to_string(),
                    data: None,
                }
            }
        }
        Err(e) => VaultResult {
            success: false,
            message: format!("Failed to delete secret: {}", e),
            data: None,
        },
    }
}
