import type { ViewType } from '../contexts/AppContext';
import './Navigation.css';

interface NavigationProps {
  onCreateEntry: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

/**
 * Navigation component with simple controls
 */
export function Navigation({
  onCreateEntry,
  currentView,
  onViewChange
}: NavigationProps) {

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="app-title">My Diary</h1>

        <div className="nav-actions">
          {currentView === 'list' && (
            <button
              className="btn btn-primary"
              onClick={onCreateEntry}
              aria-label="Create new entry"
            >
              + New Entry
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => onViewChange(currentView === 'list' ? 'calendar' : 'list')}
            aria-label="Toggle view"
          >
            {currentView === 'list' ? '📅 Calendar' : '📋 List'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => alert('Settings coming soon!')}
            aria-label="Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </nav>
  );
}
