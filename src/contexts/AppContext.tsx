import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Entry, SortOrder } from '../types';

/**
 * View types for the application routing
 */
export type ViewType = 'list' | 'editor' | 'viewer' | 'calendar' | 'gallery' | 'reports';

/**
 * Global application state interface
 */
export interface AppState {
  entries: Entry[];
  currentView: ViewType;
  selectedEntryId: string | null;
  searchQuery: string;
  sortOrder: SortOrder;
  calendarMonth: number | null;
  calendarYear: number | null;
}

/**
 * Context value interface with state and setters
 */
interface AppContextValue extends AppState {
  setEntries: (entries: Entry[]) => void;
  setCurrentView: (view: ViewType) => void;
  setSelectedEntryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setCalendarMonth: (month: number | null) => void;
  setCalendarYear: (year: number | null) => void;
}

/**
 * Create the context with undefined default value
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Props for the AppProvider component
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component that wraps the application and provides global state
 */
export function AppProvider({ children }: AppProviderProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('createdAt-desc');
  const [calendarMonth, setCalendarMonth] = useState<number | null>(null);
  const [calendarYear, setCalendarYear] = useState<number | null>(null);

  const value: AppContextValue = {
    entries,
    currentView,
    selectedEntryId,
    searchQuery,
    sortOrder,
    calendarMonth,
    calendarYear,
    setEntries,
    setCurrentView,
    setSelectedEntryId,
    setSearchQuery,
    setSortOrder,
    setCalendarMonth,
    setCalendarYear,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to access the app context
 * @throws Error if used outside of AppProvider
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
