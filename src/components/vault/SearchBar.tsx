// ═══════════════════════════════════════════════════════════════
// BUNKER - Search Bar Component
// Search and filter controls for vault
// ═══════════════════════════════════════════════════════════════

import { categoryConfig } from './types';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProject: string | null;
  setSelectedProject: (project: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  detectedProjects: string[];
  detectedCategories: string[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedProject,
  setSelectedProject,
  selectedCategory,
  setSelectedCategory,
  detectedProjects,
  detectedCategories,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}: SearchBarProps) {
  return (
    <div className="px-4 py-3 border-b border-border-warning/30 bg-concrete-dark/50 space-y-3 flex-shrink-0">
      {/* Search Input */}
      <div className="relative">
        <label htmlFor="vault-search" className="sr-only">Search secrets</label>
        <input
          id="vault-search"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search secrets..."
          aria-describedby="vault-search-results"
          className="w-full bg-concrete-dark border-2 border-border-warning/50 px-3 py-2 pl-9 text-terminal-amber font-mono text-sm focus:border-vault-yellow focus:outline-none placeholder:text-text-muted"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
          🔍
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-vault-yellow"
          >
            ✕
          </button>
        )}
      </div>

      {/* Project Tags */}
      {detectedProjects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-muted text-[10px] heading-text">PROJECTS:</span>
          {detectedProjects.map(project => (
            <button
              key={project}
              onClick={() => setSelectedProject(selectedProject === project ? null : project)}
              aria-pressed={selectedProject === project}
              aria-label={`Filter by project: ${project}`}
              className={`
                px-2 py-0.5 text-[10px] font-mono border transition-all
                ${selectedProject === project
                  ? 'bg-vault-yellow/20 border-vault-yellow text-vault-yellow'
                  : 'bg-transparent border-border-warning/30 text-text-muted hover:border-vault-yellow/50 hover:text-vault-yellow'}
              `}
            >
              {project}
            </button>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-text-muted text-[10px] heading-text">CATEGORY:</span>
        <button
          onClick={() => setSelectedCategory(null)}
          aria-pressed={!selectedCategory}
          aria-label="Show all categories"
          className={`
            px-2 py-0.5 text-[10px] font-mono border transition-all
            ${!selectedCategory
              ? 'bg-vault-yellow/20 border-vault-yellow text-vault-yellow'
              : 'bg-transparent border-border-warning/30 text-text-muted hover:border-vault-yellow/50 hover:text-vault-yellow'}
          `}
        >
          ALL
        </button>
        {detectedCategories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            aria-pressed={selectedCategory === category}
            aria-label={`Filter by category: ${category}`}
            className={`
              px-2 py-0.5 text-[10px] font-mono border transition-all flex items-center gap-1
              ${selectedCategory === category
                ? 'bg-vault-yellow/20 border-vault-yellow text-vault-yellow'
                : 'bg-transparent border-border-warning/30 text-text-muted hover:border-vault-yellow/50 hover:text-vault-yellow'}
            `}
          >
            <span aria-hidden="true">{categoryConfig[category]?.icon || '📁'}</span>
            {category}
          </button>
        ))}
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span id="vault-search-results" className="text-text-muted text-[10px]" aria-live="polite">
            Showing {filteredCount} of {totalCount} secrets
          </span>
          <button
            onClick={onClearFilters}
            className="text-[10px] text-caution hover:text-vault-yellow transition-colors"
          >
            CLEAR FILTERS
          </button>
        </div>
      )}
    </div>
  );
}
