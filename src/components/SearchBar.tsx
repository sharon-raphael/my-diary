import { useState, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

/**
 * Search bar component with debouncing
 */
export function SearchBar({
  query,
  onQueryChange,
  placeholder = 'Search entries...'
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);

  // Debounce search query updates
  useEffect(() => {
    const timer = setTimeout(() => {
      onQueryChange(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, onQueryChange]);

  // Sync with external query changes
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleClear = () => {
    setLocalQuery('');
    onQueryChange('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search entries"
      />
      {localQuery && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
