// BUNKER Keyring - Secure API Key Storage
// Uses Tauri's store plugin with encrypted storage

use crate::error::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;
use tokio::sync::RwLock;

const STORE_PATH: &str = "bunker-keys.json";
const KEYS_FIELD: &str = "api_keys";

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct StoredKeys {
    keys: HashMap<String, String>,
}

#[derive(Clone)]
pub struct KeyringManager {
    app: AppHandle,
    cache: Arc<RwLock<HashMap<String, String>>>,
}

impl KeyringManager {
    pub fn new(app: AppHandle) -> Self {
        Self {
            app,
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Initialize and load keys from store into cache
    pub async fn init(&self) -> AppResult<()> {
        let store = self
            .app
            .store(STORE_PATH)
            .map_err(|e| AppError::KeyringError(e.to_string()))?;

        if let Some(stored) = store.get(KEYS_FIELD) {
            if let Ok(keys) = serde_json::from_value::<StoredKeys>(stored.clone()) {
                let mut cache = self.cache.write().await;
                *cache = keys.keys;
            }
        }

        Ok(())
    }

    /// Store an API key securely
    pub async fn set_api_key(&self, key_name: String, key_value: String) -> AppResult<()> {
        // Update cache
        {
            let mut cache = self.cache.write().await;
            cache.insert(key_name.clone(), key_value);
        }

        // Persist to store
        self.persist_keys().await
    }

    /// Get an API key from secure storage
    pub async fn get_api_key(&self, key_name: &str) -> AppResult<Option<String>> {
        let cache = self.cache.read().await;
        Ok(cache.get(key_name).cloned())
    }

    /// Check if an API key exists
    pub async fn has_api_key(&self, key_name: &str) -> AppResult<bool> {
        let cache = self.cache.read().await;
        Ok(cache.contains_key(key_name))
    }

    /// Remove an API key
    pub async fn remove_api_key(&self, key_name: &str) -> AppResult<()> {
        // Remove from cache
        {
            let mut cache = self.cache.write().await;
            cache.remove(key_name);
        }

        // Persist to store
        self.persist_keys().await
    }

    /// List all stored key names (not values!)
    pub async fn list_key_names(&self) -> AppResult<Vec<String>> {
        let cache = self.cache.read().await;
        Ok(cache.keys().cloned().collect())
    }

    /// Persist cache to store
    async fn persist_keys(&self) -> AppResult<()> {
        let cache = self.cache.read().await;
        let stored = StoredKeys {
            keys: cache.clone(),
        };

        let store = self
            .app
            .store(STORE_PATH)
            .map_err(|e| AppError::KeyringError(e.to_string()))?;

        store.set(
            KEYS_FIELD,
            serde_json::to_value(&stored).map_err(|e| AppError::SerializationError(e.to_string()))?,
        );

        store
            .save()
            .map_err(|e| AppError::KeyringError(e.to_string()))?;

        Ok(())
    }
}

// Tauri commands for API key management

#[tauri::command]
pub async fn set_api_key(
    keyring: tauri::State<'_, KeyringManager>,
    name: String,
    value: String,
) -> Result<(), AppError> {
    keyring.set_api_key(name, value).await
}

#[tauri::command]
pub async fn remove_api_key(
    keyring: tauri::State<'_, KeyringManager>,
    name: String,
) -> Result<(), AppError> {
    keyring.remove_api_key(&name).await
}

#[tauri::command]
pub async fn check_api_key(
    keyring: tauri::State<'_, KeyringManager>,
    name: String,
) -> Result<bool, AppError> {
    keyring.has_api_key(&name).await
}

#[tauri::command]
pub async fn list_api_keys(
    keyring: tauri::State<'_, KeyringManager>,
) -> Result<Vec<String>, AppError> {
    keyring.list_key_names().await
}
