import { useRef } from 'react';
import { SearchBar } from './SearchBar';
import type { SortOrder } from '../types';
import type { ViewType } from '../contexts/AppContext';
import './Navigation.css';

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onCreateEntry: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

/**
 * Navigation component with search, sort, and import/export
 */
export function Navigation({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  onExport,
  onImport,
  onCreateEntry,
  currentView,
  onViewChange
}: NavigationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="app-title">Journey Journal</h1>
        {currentView === 'list' && (
          <button
            className="btn btn-primary"
            onClick={onCreateEntry}
            aria-label="Create new entry"
          >
            + New Entry
          </button>
        )}
      </div>

      <div className="nav-controls">
        <div className="view-switcher">
          <button
            className={`btn btn-view ${currentView === 'list' ? 'btn-view-active' : ''}`}
            onClick={() => onViewChange('list')}
            aria-label="Switch to list view"
            aria-pressed={currentView === 'list'}
          >
            List
          </button>
          <button
            className={`btn btn-view ${currentView === 'calendar' ? 'btn-view-active' : ''}`}
            onClick={() => onViewChange('calendar')}
            aria-label="Switch to calendar view"
            aria-pressed={currentView === 'calendar'}
          >
            Calendar
          </button>
        </div>

        <SearchBar
          query={searchQuery}
          onQueryChange={onSearchChange}
          placeholder="Search entries..."
        />

        <div className="nav-actions">
          <div className="sort-control">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value as SortOrder)}
              aria-label="Sort entries"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="modifiedAt-desc">Recently Modified</option>
              <option value="modifiedAt-asc">Least Recently Modified</option>
            </select>
          </div>

          <button
            className="btn btn-secondary"
            onClick={onExport}
            aria-label="Export entries"
          >
            Export
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleImportClick}
            aria-label="Import entries"
          >
            Import
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Select file to import"
          />
        </div>
      </div>
    </nav>
  );
}
