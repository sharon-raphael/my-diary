import type { ViewType } from '../contexts/AppContext';
import './Navigation.css';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSettings: () => void;
}

/**
 * Navigation component with simple controls
 */
export function Navigation({
  currentView,
  onViewChange,
  onSettings
}: NavigationProps) {

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1 className="app-title">My Diary</h1>

        <div className="nav-actions">          <button
          className="btn btn-secondary"
          onClick={() => onViewChange(currentView === 'list' ? 'calendar' : 'list')}
          aria-label="Toggle view"
        >
          {currentView === 'list' ? '📅 Calendar' : '📋 List'}
        </button>

          <button
            className="btn btn-secondary"
            onClick={onSettings}
            aria-label="Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </nav>
  );
}
