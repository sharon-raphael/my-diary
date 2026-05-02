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

        <div className="nav-actions">
          <button
            className={`btn ${currentView === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onViewChange('calendar')}
            aria-label="Calendar view"
          >
            📅 Calendar
          </button>

          <button
            className={`btn ${currentView === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onViewChange('gallery')}
            aria-label="Gallery view"
          >
            🖼️ Gallery
          </button>

          <button
            className={`btn ${currentView === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onViewChange('list')}
            aria-label="List view"
          >
            📋 List
          </button>

          <button
            className={`btn ${currentView === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onViewChange('reports')}
            aria-label="Reports view"
          >
            📊 Reports
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
