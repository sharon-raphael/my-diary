import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntries } from './useEntries';
import { storageService } from '../services/StorageService';
import type { Entry } from '../types/entry';

// Mock the storage service
vi.mock('../services/StorageService', () => ({
  storageService: {
    loadEntries: vi.fn(),
    saveEntry: vi.fn(),
    deleteEntry: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn()
  }
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234')
}));

describe('useEntries', () => {
  const mockEntry: Entry = {
    id: 'entry-1',
    title: 'Test Entry',
    content: 'Test content',
    createdAt: 1000000,
    lastModifiedAt: 1000000,
    mood: 'happy',
    tags: ['test'],
    version: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(storageService.loadEntries).mockResolvedValue([]);
    vi.mocked(storageService.saveEntry).mockResolvedValue();
    vi.mocked(storageService.deleteEntry).mockResolvedValue();
  });

  describe('initialization', () => {
    it('should start with loading state true', () => {
      const { result } = renderHook(() => useEntries());
      
      expect(result.current.loading).toBe(true);
    });

    it('should load entries on mount', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(storageService.loadEntries).toHaveBeenCalledTimes(1);
      expect(result.current.entries).toEqual([mockEntry]);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      const error = new Error('Load failed');
      vi.mocked(storageService.loadEntries).mockRejectedValue(error);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toEqual(error);
      expect(result.current.entries).toEqual([]);
    });
  });

  describe('createEntry', () => {
    it('should create a new entry with generated ID and timestamps', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newEntryData = {
        title: 'New Entry',
        content: 'New content',
        mood: null,
        tags: [],
        version: 1
      };

      let createdEntry: Entry | undefined;
      
      await act(async () => {
        createdEntry = await result.current.createEntry(newEntryData);
      });

      expect(createdEntry).toBeDefined();
      expect(createdEntry!.id).toBe('test-uuid-1234');
      expect(createdEntry!.title).toBe('New Entry');
      expect(createdEntry!.content).toBe('New content');
      expect(createdEntry!.createdAt).toBeGreaterThan(0);
      expect(createdEntry!.lastModifiedAt).toBe(createdEntry!.createdAt);
      expect(storageService.saveEntry).toHaveBeenCalledWith(createdEntry);
      expect(result.current.entries).toContainEqual(createdEntry);
    });

    it('should add created entry to entries array', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newEntryData = {
        title: 'New Entry',
        content: 'New content',
        mood: null,
        tags: [],
        version: 1
      };

      await act(async () => {
        await result.current.createEntry(newEntryData);
      });

      expect(result.current.entries).toHaveLength(2);
      expect(result.current.entries[0]).toEqual(mockEntry);
      expect(result.current.entries[1].title).toBe('New Entry');
    });

    it('should handle creation errors', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([]);
      const error = new Error('Save failed');
      vi.mocked(storageService.saveEntry).mockRejectedValue(error);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newEntryData = {
        title: 'New Entry',
        content: 'New content',
        mood: null,
        tags: [],
        version: 1
      };

      await expect(async () => {
        await act(async () => {
          await result.current.createEntry(newEntryData);
        });
      }).rejects.toThrow('Save failed');
    });
  });

  describe('updateEntry', () => {
    it('should update an existing entry', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      let updatedEntry: Entry | undefined;

      await act(async () => {
        updatedEntry = await result.current.updateEntry('entry-1', updates);
      });

      expect(updatedEntry).toBeDefined();
      expect(updatedEntry!.title).toBe('Updated Title');
      expect(updatedEntry!.content).toBe('Updated content');
      expect(updatedEntry!.createdAt).toBe(mockEntry.createdAt); // Preserved
      expect(updatedEntry!.lastModifiedAt).toBeGreaterThan(mockEntry.lastModifiedAt);
      expect(storageService.saveEntry).toHaveBeenCalledWith(updatedEntry);
    });

    it('should preserve createdAt timestamp when updating', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalCreatedAt = mockEntry.createdAt;

      await act(async () => {
        await result.current.updateEntry('entry-1', { title: 'Updated' });
      });

      const updatedEntry = result.current.entries.find(e => e.id === 'entry-1');
      expect(updatedEntry!.createdAt).toBe(originalCreatedAt);
    });

    it('should update lastModifiedAt timestamp', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const originalModifiedAt = mockEntry.lastModifiedAt;

      await act(async () => {
        await result.current.updateEntry('entry-1', { title: 'Updated' });
      });

      const updatedEntry = result.current.entries.find(e => e.id === 'entry-1');
      expect(updatedEntry!.lastModifiedAt).toBeGreaterThan(originalModifiedAt);
    });

    it('should throw error when updating non-existent entry', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.updateEntry('non-existent', { title: 'Updated' });
        });
      }).rejects.toThrow('Entry with id non-existent not found');
    });

    it('should not allow changing entry ID', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateEntry('entry-1', { id: 'different-id' } as any);
      });

      const updatedEntry = result.current.entries.find(e => e.id === 'entry-1');
      expect(updatedEntry!.id).toBe('entry-1'); // ID unchanged
    });
  });

  describe('deleteEntry', () => {
    it('should delete an entry', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.entries).toHaveLength(1);

      await act(async () => {
        await result.current.deleteEntry('entry-1');
      });

      expect(storageService.deleteEntry).toHaveBeenCalledWith('entry-1');
      expect(result.current.entries).toHaveLength(0);
    });

    it('should handle deletion errors', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      const error = new Error('Delete failed');
      vi.mocked(storageService.deleteEntry).mockRejectedValue(error);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.deleteEntry('entry-1');
        });
      }).rejects.toThrow('Delete failed');

      expect(result.current.entries).toHaveLength(1); // Entry not removed
    });
  });

  describe('getEntry', () => {
    it('should return entry by ID', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const entry = result.current.getEntry('entry-1');
      expect(entry).toEqual(mockEntry);
    });

    it('should return undefined for non-existent entry', async () => {
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);
      
      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const entry = result.current.getEntry('non-existent');
      expect(entry).toBeUndefined();
    });
  });

  describe('exportEntries', () => {
    it('should call exportData from storage service', async () => {
      const mockJsonData = JSON.stringify({ entries: [mockEntry], version: 1 });
      vi.mocked(storageService.exportData).mockReturnValue(mockJsonData);
      vi.mocked(storageService.loadEntries).mockResolvedValue([mockEntry]);

      // Mock URL methods
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock document methods
      const mockClick = vi.fn();
      const mockLink = document.createElement('a');
      mockLink.click = mockClick;
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.exportEntries();
      });

      expect(storageService.exportData).toHaveBeenCalled();
    });
  });

  describe('importEntries', () => {
    it('should import entries from file', async () => {
      const mockJsonData = JSON.stringify({ entries: [mockEntry], version: 1 });
      
      // Create a proper mock File with text() method
      const mockFile = {
        text: vi.fn().mockResolvedValue(mockJsonData),
        name: 'import.json',
        type: 'application/json'
      } as any;
      
      vi.mocked(storageService.loadEntries)
        .mockResolvedValueOnce([]) // Initial load
        .mockResolvedValueOnce([mockEntry]); // After import
      vi.mocked(storageService.importData).mockResolvedValue([mockEntry]);

      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.entries).toHaveLength(0);

      await act(async () => {
        await result.current.importEntries(mockFile);
      });

      expect(mockFile.text).toHaveBeenCalled();
      expect(storageService.importData).toHaveBeenCalledWith(mockJsonData);
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0]).toEqual(mockEntry);
    });

    it('should handle import errors', async () => {
      const error = new Error('Import failed');
      
      // Create a proper mock File with text() method
      const mockFile = {
        text: vi.fn().mockResolvedValue('invalid json'),
        name: 'import.json',
        type: 'application/json'
      } as any;
      
      vi.mocked(storageService.loadEntries).mockResolvedValue([]);
      vi.mocked(storageService.importData).mockRejectedValue(error);

      const { result } = renderHook(() => useEntries());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.importEntries(mockFile);
        });
      }).rejects.toThrow('Import failed');
    });
  });
});
