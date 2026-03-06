import { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { useEntries } from './hooks/useEntries';
import { useSearch } from './hooks/useSearch';
import { useSort } from './hooks/useSort';
import { EntryList, EntryEditor, EntryViewer, Navigation, SettingsModal } from './components';
import { CalendarView } from './components/calendar';
import { getCalendarDate } from './utils/dateFormatter';
import type { Entry } from './types';
import './App.css';

/**
 * Main application component with routing logic
 */
function AppContent() {
  const { currentView, selectedEntryId, setCurrentView, setSelectedEntryId } = useAppContext();
  const { entries, loading, error, createEntry, updateEntry, deleteEntry, getEntry, exportEntries, importEntries } = useEntries();
  const { filteredEntries, query, setQuery } = useSearch(entries);
  const { sortedEntries, sortOrder, setSortOrder } = useSort(filteredEntries);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [initialEditorDate, setInitialEditorDate] = useState<string | undefined>(undefined);
  const [previousBaseView, setPreviousBaseView] = useState<'list' | 'calendar'>('calendar');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  /**
   * Show notification
   */
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Handles entry selection - navigates to viewer
   */
  const handleSelectEntry = (entryId: string) => {
    if (currentView === 'list' || currentView === 'calendar') {
      setPreviousBaseView(currentView);
    }
    setSelectedEntryId(entryId);
    setCurrentView('viewer');
  };

  /**
   * Handles entry deletion
   */
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      setCurrentView(previousBaseView);
      setSelectedEntryId(null);
      showNotification('Entry deleted successfully');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      showNotification('Failed to delete entry', 'error');
    }
  };

  /**
   * Handles retry for failed entry loading
   */
  const handleRetryLoadEntries = () => {
    // Reload the page to trigger useEntries hook again
    window.location.reload();
  };

  /**
   * Handles create entry button click
   */
  const handleCreateEntry = (date?: Date) => {
    if (currentView === 'list' || currentView === 'calendar') {
      setPreviousBaseView(currentView);
    }
    setSelectedEntryId(null);
    setInitialEditorDate(date ? getCalendarDate(date.getTime()) : undefined);
    setCurrentView('editor');
  };

  /**
   * Handles saving an entry (create or update)
   */
  const handleSaveEntry = async (entryData: Omit<Entry, 'id' | 'createdAt' | 'lastModifiedAt' | 'version'>) => {
    try {
      if (selectedEntryId) {
        await updateEntry(selectedEntryId, entryData);
        showNotification('Entry updated successfully');
      } else {
        await createEntry(entryData);
        showNotification('Entry created successfully');
      }
      setCurrentView(previousBaseView);
      setSelectedEntryId(null);
      setInitialEditorDate(undefined);
    } catch (error) {
      console.error('Failed to save entry:', error);
      showNotification('Failed to save entry', 'error');
    }
  };

  /**
   * Handles cancel button in editor
   */
  const handleCancelEdit = () => {
    setCurrentView(previousBaseView);
    setSelectedEntryId(null);
    setInitialEditorDate(undefined);
  };

  /**
   * Handles edit button in viewer
   */
  const handleEditEntry = () => {
    setCurrentView('editor');
  };

  /**
   * Handles back button in viewer
   */
  const handleBackToList = () => {
    setCurrentView(previousBaseView);
    setSelectedEntryId(null);
  };

  // Basic routing logic between views
  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <div>
            <EntryList
              entries={sortedEntries}
              onSelectEntry={handleSelectEntry}
              onDeleteEntry={handleDeleteEntry}
              searchQuery={query}
              onSearchChange={setQuery}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
          </div>
        );
      case 'editor':
        const entryToEdit = selectedEntryId ? getEntry(selectedEntryId) : undefined;
        return (
          <EntryEditor
            entry={entryToEdit}
            initialDate={initialEditorDate}
            onSave={handleSaveEntry}
            onCancel={handleCancelEdit}
          />
        );
      case 'viewer':
        const entryToView = selectedEntryId ? getEntry(selectedEntryId) : null;
        if (!entryToView) {
          setCurrentView(previousBaseView);
          setSelectedEntryId(null);
          return null;
        }
        return (
          <EntryViewer
            entry={entryToView}
            onEdit={handleEditEntry}
            onDelete={() => handleDeleteEntry(entryToView.id)}
            onBack={handleBackToList}
            onCreateEntry={() => {
              const entryDate = entryToView.date ? new Date(`${entryToView.date}T12:00:00`) : new Date();
              handleCreateEntry(entryDate);
            }}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            entries={entries}
            onSelectEntry={handleSelectEntry}
            onCreateEntry={handleCreateEntry}
            loading={loading}
            error={error}
            onRetry={handleRetryLoadEntries}
          />
        );
      default:
        return (
          <div>
            <EntryList
              entries={sortedEntries}
              onSelectEntry={handleSelectEntry}
              onDeleteEntry={handleDeleteEntry}
              searchQuery={query}
              onSearchChange={setQuery}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
          </div>
        );
    }
  };

  return (
    <div className="app">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onSettings={() => setShowSettingsModal(true)}
      />
      {renderView()}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onExport={exportEntries}
          onImport={importEntries}
        />
      )}
    </div>
  );
}

/**
 * Root App component with context provider
 */
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
