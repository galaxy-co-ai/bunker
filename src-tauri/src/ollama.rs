// OLLAMA STATUS - Query local Ollama instance

use serde::{Deserialize, Serialize};
use sysinfo::System;

const OLLAMA_BASE_URL: &str = "http://localhost:11434";

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub model: Option<String>,
    pub modified_at: Option<String>,
    pub size: Option<u64>,
    pub digest: Option<String>,
    pub details: Option<OllamaModelDetails>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModelDetails {
    pub parent_model: Option<String>,
    pub format: Option<String>,
    pub family: Option<String>,
    pub families: Option<Vec<String>>,
    pub parameter_size: Option<String>,
    pub quantization_level: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaTagsResponse {
    pub models: Option<Vec<OllamaModel>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaRunningModel {
    pub name: String,
    pub model: Option<String>,
    pub size: Option<u64>,
    pub digest: Option<String>,
    pub expires_at: Option<String>,
    pub size_vram: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaRunningResponse {
    pub models: Option<Vec<OllamaRunningModel>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub online: bool,
    pub models: Vec<OllamaModelStatus>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModelStatus {
    pub id: String,
    pub name: String,
    pub status: String, // 'active' | 'idle' | 'offline'
    pub ram_usage: f64,      // GB
    pub ram_capacity: f64,   // GB (total system RAM)
    pub size_gb: f64,        // Model size in GB
    pub parameter_size: Option<String>,
    pub quantization: Option<String>,
}

/// Format model name for display (e.g., "llama3.1:8b" -> "LLAMA 3.1 8B")
fn format_model_name(name: &str) -> String {
    let base_name = name.split(':').next().unwrap_or(name);
    let tag = name.split(':').nth(1).unwrap_or("");

    let formatted = base_name
        .to_uppercase()
        .replace("LLAMA", "LLAMA ")
        .replace("NEMOTRON", "NEMOTRON ")
        .replace("MISTRAL", "MISTRAL ")
        .replace("QWEN", "QWEN ")
        .replace("DEEPSEEK", "DEEPSEEK ")
        .replace("PHI", "PHI ")
        .replace("GEMMA", "GEMMA ");

    let formatted = formatted.trim().to_string();

    if !tag.is_empty() {
        format!("{} {}", formatted, tag.to_uppercase())
    } else {
        formatted
    }
}

/// Get Ollama status and models
#[tauri::command]
pub async fn get_ollama_status() -> OllamaStatus {
    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
    {
        Ok(c) => c,
        Err(e) => return OllamaStatus {
            online: false,
            models: vec![],
            error: Some(format!("Failed to create HTTP client: {}", e)),
        },
    };

    // Check if Ollama is running by getting tags
    let tags_url = format!("{}/api/tags", OLLAMA_BASE_URL);
    let tags_response = match client.get(&tags_url).send().await {
        Ok(resp) => resp,
        Err(_) => return OllamaStatus {
            online: false,
            models: vec![],
            error: Some("Ollama not reachable - ensure Ollama is running".to_string()),
        },
    };

    if !tags_response.status().is_success() {
        return OllamaStatus {
            online: false,
            models: vec![],
            error: Some(format!("Ollama returned status: {}", tags_response.status())),
        };
    }

    let tags: OllamaTagsResponse = match tags_response.json().await {
        Ok(t) => t,
        Err(e) => return OllamaStatus {
            online: true,
            models: vec![],
            error: Some(format!("Failed to parse tags: {}", e)),
        },
    };

    // Get running models to determine active status
    let ps_url = format!("{}/api/ps", OLLAMA_BASE_URL);
    let running_models: Vec<String> = match client.get(&ps_url).send().await {
        Ok(resp) if resp.status().is_success() => {
            match resp.json::<OllamaRunningResponse>().await {
                Ok(ps) => ps.models.unwrap_or_default().iter().map(|m| m.name.clone()).collect(),
                Err(_) => vec![],
            }
        }
        _ => vec![],
    };

    // Get system RAM for capacity reference
    let sys = System::new_all();
    let total_ram_gb = sys.total_memory() as f64 / 1024.0 / 1024.0 / 1024.0;

    // Convert models to our status format
    let ollama_models = tags.models.unwrap_or_default();
    let models: Vec<OllamaModelStatus> = ollama_models.iter().map(|model| {
        let is_running = running_models.iter().any(|r| {
            r.starts_with(&model.name) || model.name.starts_with(r) || r == &model.name
        });
        let size_gb = model.size.unwrap_or(0) as f64 / 1024.0 / 1024.0 / 1024.0;

        let (param_size, quant) = if let Some(ref details) = model.details {
            (details.parameter_size.clone(), details.quantization_level.clone())
        } else {
            (None, None)
        };

        OllamaModelStatus {
            id: model.name.replace([':', '.'], "-"),
            name: format_model_name(&model.name),
            status: if is_running { "active".to_string() } else { "idle".to_string() },
            ram_usage: if is_running { size_gb } else { 0.0 },
            ram_capacity: total_ram_gb,
            size_gb,
            parameter_size: param_size,
            quantization: quant,
        }
    }).collect();

    OllamaStatus {
        online: true,
        models,
        error: None,
    }
}
