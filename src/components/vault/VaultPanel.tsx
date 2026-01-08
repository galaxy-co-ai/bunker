// ═══════════════════════════════════════════════════════════════
// BUNKER - Secrets Vault Panel
// Fallout-themed encrypted credentials manager
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';

import { Secret, VaultResult, ParsedSecret, parseSecretName } from './types';
import { CategorySection } from './CategorySection';
import { SearchBar } from './SearchBar';
import { AddEditModal } from './AddEditModal';

export function VaultPanel() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [secretValues, setSecretValues] = useState<Record<string, string>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<string | null>(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load secrets on mount
  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<VaultResult>('vault_list');
      if (result.success && result.data) {
        setSecrets(result.data);
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(`Failed to load vault: ${e}`);
    }
    setLoading(false);
  };

  // Parse all secrets to extract metadata
  const parsedSecrets: ParsedSecret[] = useMemo(() => {
    return secrets.map(secret => ({
      ...secret,
      ...parseSecretName(secret.name),
    }));
  }, [secrets]);

  // Extract unique projects from secrets
  const detectedProjects = useMemo(() => {
    const projects = new Set<string>();
    parsedSecrets.forEach(s => {
      if (s.project) projects.add(s.project);
    });
    return Array.from(projects).sort();
  }, [parsedSecrets]);

  // Extract unique categories
  const detectedCategories = useMemo(() => {
    const categories = new Set<string>();
    parsedSecrets.forEach(s => categories.add(s.category));
    return Array.from(categories).sort();
  }, [parsedSecrets]);

  // Filter secrets based on search and filters
  const filteredSecrets = useMemo(() => {
    return parsedSecrets.filter(secret => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = secret.name.toLowerCase().includes(query);
        const matchesCategory = secret.category.toLowerCase().includes(query);
        const matchesProject = secret.project?.toLowerCase().includes(query);
        const matchesService = secret.service?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesProject && !matchesService) {
          return false;
        }
      }

      // Project filter
      if (selectedProject && secret.project !== selectedProject) {
        return false;
      }

      // Category filter
      if (selectedCategory && secret.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [parsedSecrets, searchQuery, selectedProject, selectedCategory]);

  // Group filtered secrets by category
  const groupedSecrets = useMemo(() => {
    return filteredSecrets.reduce((acc, secret) => {
      const category = secret.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(secret);
      return acc;
    }, {} as Record<string, ParsedSecret[]>);
  }, [filteredSecrets]);

  // Sort categories
  const sortedCategories = Object.keys(groupedSecrets).sort((a, b) => {
    const order = ['AI Services', 'Database', 'Authentication', 'Automation', 'Monitoring', 'Payments', 'Cloud Services', 'Version Control', 'Sales & CRM', 'Security', 'Other'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const revealSecret = async (name: string) => {
    if (revealedSecrets.has(name)) {
      setRevealedSecrets(prev => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      return;
    }

    try {
      const result = await invoke<VaultResult>('vault_get', { name });
      if (result.success && result.data?.[0]?.value) {
        setSecretValues(prev => ({ ...prev, [name]: result.data![0].value! }));
        setRevealedSecrets(prev => new Set(prev).add(name));
      }
    } catch (e) {
      console.error('Failed to reveal secret:', e);
    }
  };

  const copyToClipboard = async (name: string) => {
    let value = secretValues[name];
    if (!value) {
      const result = await invoke<VaultResult>('vault_get', { name });
      if (result.success && result.data?.[0]?.value) {
        value = result.data[0].value;
      }
    }
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  const deleteSecret = async (name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      const result = await invoke<VaultResult>('vault_delete', { name });
      if (result.success) {
        loadSecrets();
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(`Failed to delete: ${e}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProject(null);
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery || selectedProject || selectedCategory;

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
        <h2 className="heading-text text-sm flex items-center gap-2">
          <motion.span
            className="text-vault-yellow"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔐
          </motion.span>
          SECRETS VAULT
          <span className="text-text-muted text-xs ml-2">
            AES-256 ENCRYPTED
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            className="vault-button vault-button-small"
            onClick={() => setShowAddModal(true)}
            aria-label="Add new secret"
          >
            + ADD SECRET
          </button>
          <button
            className="vault-button vault-button-small"
            onClick={loadSecrets}
            aria-label="Refresh secrets list"
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        detectedProjects={detectedProjects}
        detectedCategories={detectedCategories}
        filteredCount={filteredSecrets.length}
        totalCount={secrets.length}
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="terminal-text text-lg"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              DECRYPTING VAULT...
            </motion.div>
          </div>
        ) : error ? (
          <div className="text-danger text-center py-8">
            <div className="text-2xl mb-2">⚠️</div>
            <div>{error}</div>
            <button
              className="vault-button vault-button-small mt-4"
              onClick={loadSecrets}
            >
              RETRY
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map((category, catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <CategorySection
                  category={category}
                  secrets={groupedSecrets[category]}
                  revealedSecrets={revealedSecrets}
                  secretValues={secretValues}
                  onReveal={revealSecret}
                  onCopy={copyToClipboard}
                  onEdit={setEditingSecret}
                  onDelete={deleteSecret}
                />
              </motion.div>
            ))}

            {filteredSecrets.length === 0 && secrets.length > 0 && (
              <div className="text-center py-12 text-text-muted">
                <div className="text-4xl mb-4">🔍</div>
                <div className="heading-text">NO MATCHES FOUND</div>
                <div className="text-sm mt-2">Try adjusting your search or filters</div>
                <button
                  onClick={clearFilters}
                  className="vault-button vault-button-small mt-4"
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}

            {secrets.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <div className="text-4xl mb-4">🔒</div>
                <div className="heading-text">VAULT EMPTY</div>
                <div className="text-sm mt-2">Add your first secret to get started</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-2 border-t border-border-warning/30 bg-concrete-dark/50 flex justify-between text-[10px] text-text-muted flex-shrink-0">
        <span>TOTAL: {secrets.length} CREDENTIALS</span>
        <span>PROJECTS: {detectedProjects.length}</span>
        <span>CATEGORIES: {detectedCategories.length}</span>
        <span className="text-safe">STATUS: ENCRYPTED</span>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingSecret) && (
          <AddEditModal
            editingName={editingSecret}
            initialValue={editingSecret ? secretValues[editingSecret] : undefined}
            existingProjects={detectedProjects}
            onClose={() => {
              setShowAddModal(false);
              setEditingSecret(null);
            }}
            onSave={async (name, value) => {
              try {
                const result = await invoke<VaultResult>('vault_add', { name, value });
                if (result.success) {
                  loadSecrets();
                  setShowAddModal(false);
                  setEditingSecret(null);
                } else {
                  alert(result.message);
                }
              } catch (e) {
                alert(`Failed to save: ${e}`);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default VaultPanel;
