import { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { useEntries } from './hooks/useEntries';
import { useSearch } from './hooks/useSearch';
import { useSort } from './hooks/useSort';
import { EntryList, EntryEditor, EntryViewer, Navigation } from './components';
import { CalendarView } from './components/calendar';
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
    setSelectedEntryId(entryId);
    setCurrentView('viewer');
  };

  /**
   * Handles entry deletion
   */
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      setCurrentView('list');
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
  const handleCreateEntry = () => {
    setSelectedEntryId(null);
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
      setCurrentView('list');
      setSelectedEntryId(null);
    } catch (error) {
      console.error('Failed to save entry:', error);
      showNotification('Failed to save entry', 'error');
    }
  };

  /**
   * Handles cancel button in editor
   */
  const handleCancelEdit = () => {
    setCurrentView('list');
    setSelectedEntryId(null);
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
    setCurrentView('list');
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
            />
          </div>
        );
      case 'editor':
        const entryToEdit = selectedEntryId ? getEntry(selectedEntryId) : undefined;
        return (
          <EntryEditor
            entry={entryToEdit}
            onSave={handleSaveEntry}
            onCancel={handleCancelEdit}
          />
        );
      case 'viewer':
        const entryToView = selectedEntryId ? getEntry(selectedEntryId) : null;
        if (!entryToView) {
          setCurrentView('list');
          setSelectedEntryId(null);
          return null;
        }
        return (
          <EntryViewer
            entry={entryToView}
            onEdit={handleEditEntry}
            onDelete={() => handleDeleteEntry(entryToView.id)}
            onBack={handleBackToList}
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
            <h1 style={{ padding: '20px' }}>Journey Journal</h1>
            <EntryList
              entries={sortedEntries}
              onSelectEntry={handleSelectEntry}
              onDeleteEntry={handleDeleteEntry}
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
        searchQuery={query}
        onSearchChange={setQuery}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onExport={exportEntries}
        onImport={importEntries}
        onCreateEntry={handleCreateEntry}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      {renderView()}
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
