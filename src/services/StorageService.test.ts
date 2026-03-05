import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './StorageService';
import type { Entry } from '../types/entry';
import { StorageError } from '../types/errors';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storageService = new StorageService();
  });

  describe('saveEntry and loadEntries', () => {
    it('should save and load a single entry', async () => {
      const entry: Entry = {
        id: 'test-id-1',
        title: 'Test Entry',
        date: '2024-01-01',
        content: 'This is test content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: 'happy',
        tags: ['test', 'example'],
        version: 1
      };

      await storageService.saveEntry(entry);
      const entries = await storageService.loadEntries();

      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual(entry);
    });

    it('should save multiple entries', async () => {
      const entry1: Entry = {
        id: 'test-id-1',
        title: 'Entry 1',
        date: '2024-01-01',
        content: 'Content 1',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: 'happy',
        tags: [],
        version: 1
      };

      const entry2: Entry = {
        id: 'test-id-2',
        title: 'Entry 2',
        date: '2024-01-01',
        content: 'Content 2',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: ['tag1'],
        version: 1
      };

      await storageService.saveEntry(entry1);
      await storageService.saveEntry(entry2);
      const entries = await storageService.loadEntries();

      expect(entries).toHaveLength(2);
      expect(entries.find(e => e.id === 'test-id-1')).toEqual(entry1);
      expect(entries.find(e => e.id === 'test-id-2')).toEqual(entry2);
    });

    it('should update an existing entry', async () => {
      const entry: Entry = {
        id: 'test-id-1',
        title: 'Original Title',
        date: '2024-01-01',
        content: 'Original content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: 'happy',
        tags: [],
        version: 1
      };

      await storageService.saveEntry(entry);

      const updatedEntry: Entry = {
        ...entry,
        title: 'Updated Title',
        date: '2024-01-01',
        content: 'Updated content',
        lastModifiedAt: Date.now()
      };

      await storageService.saveEntry(updatedEntry);
      const entries = await storageService.loadEntries();

      expect(entries).toHaveLength(1);
      expect(entries[0].title).toBe('Updated Title');
      expect(entries[0].content).toBe('Updated content');
    });

    it('should return empty array when no entries exist', async () => {
      const entries = await storageService.loadEntries();
      expect(entries).toEqual([]);
    });
  });

  describe('deleteEntry', () => {
    it('should delete an entry by id', async () => {
      const entry1: Entry = {
        id: 'test-id-1',
        title: 'Entry 1',
        date: '2024-01-01',
        content: 'Content 1',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      const entry2: Entry = {
        id: 'test-id-2',
        title: 'Entry 2',
        date: '2024-01-01',
        content: 'Content 2',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      await storageService.saveEntry(entry1);
      await storageService.saveEntry(entry2);
      await storageService.deleteEntry('test-id-1');

      const entries = await storageService.loadEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('test-id-2');
    });

    it('should handle deleting non-existent entry gracefully', async () => {
      await storageService.deleteEntry('non-existent-id');
      const entries = await storageService.loadEntries();
      expect(entries).toEqual([]);
    });
  });

  describe('savePreferences and loadPreferences', () => {
    it('should save and load preferences', async () => {
      const preferences = {
        sortOrder: 'createdAt-asc' as const,
        theme: 'dark' as const,
        defaultMood: 'happy' as const,
        version: 1
      };

      await storageService.savePreferences(preferences);
      const loaded = await storageService.loadPreferences();

      expect(loaded).toEqual(preferences);
    });

    it('should return default preferences when none exist', async () => {
      const preferences = await storageService.loadPreferences();

      expect(preferences).toEqual({
        sortOrder: 'createdAt-desc',
        theme: 'auto',
        defaultMood: null,
        version: 1
      });
    });
  });

  describe('error handling', () => {
    it('should handle corrupted data gracefully', async () => {
      // Manually set corrupted data
      localStorage.setItem('journal_entries', 'invalid json{');

      await expect(storageService.loadEntries()).rejects.toThrow(StorageError);
      await expect(storageService.loadEntries()).rejects.toThrow('Corrupted data in storage');
    });

    it('should skip corrupted entries and load valid ones', async () => {
      const validEntry: Entry = {
        id: 'valid-id',
        title: 'Valid Entry',
        date: '2024-01-01',
        content: 'Valid content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      await storageService.saveEntry(validEntry);

      // Manually corrupt the data by adding an invalid entry
      const data = localStorage.getItem('journal_entries');
      if (data) {
        const container = JSON.parse(data);
        container.entries.push({
          id: 'corrupted-id',
          // Missing required fields
        });
        localStorage.setItem('journal_entries', JSON.stringify(container));
      }

      const entries = await storageService.loadEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('valid-id');
    });

    it('should throw StorageError when quota is exceeded', async () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      const entry: Entry = {
        id: 'test-id',
        title: 'Test',
        date: '2024-01-01',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      await expect(storageService.saveEntry(entry)).rejects.toThrow(StorageError);
      await expect(storageService.saveEntry(entry)).rejects.toThrow('Storage quota exceeded');

      // Restore original setItem
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('exportData and importData', () => {
    it('should export entries as JSON string', async () => {
      const entry: Entry = {
        id: 'test-id',
        title: 'Test Entry',
        date: '2024-01-01',
        content: 'Test content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: 'happy',
        tags: ['test'],
        version: 1
      };

      await storageService.saveEntry(entry);
      const exported = storageService.exportData();

      expect(exported).toBeTruthy();
      const parsed = JSON.parse(exported);
      expect(parsed.entries).toHaveLength(1);
      expect(parsed.entries[0].id).toBe('test-id');
    });

    it('should import entries from JSON string', async () => {
      const entry: Entry = {
        id: 'imported-id',
        title: 'Imported Entry',
        date: '2024-01-01',
        content: 'Imported content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: 'calm',
        tags: ['imported'],
        version: 1
      };

      const importData = JSON.stringify({
        entries: [entry],
        version: 1,
        lastUpdated: Date.now()
      });

      const imported = await storageService.importData(importData);
      expect(imported).toHaveLength(1);
      expect(imported[0].id).toBe('imported-id');

      const entries = await storageService.loadEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('imported-id');
    });

    it('should deduplicate entries during import', async () => {
      const entry: Entry = {
        id: 'duplicate-id',
        title: 'Original',
        date: '2024-01-01',
        content: 'Original content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      await storageService.saveEntry(entry);

      const duplicateEntry: Entry = {
        ...entry,
        title: 'Duplicate',
        date: '2024-01-01',
        content: 'Duplicate content'
      };

      const importData = JSON.stringify({
        entries: [duplicateEntry],
        version: 1,
        lastUpdated: Date.now()
      });

      await storageService.importData(importData);
      const entries = await storageService.loadEntries();

      // Should still have only 1 entry (original, not duplicate)
      expect(entries).toHaveLength(1);
      expect(entries[0].title).toBe('Original');
    });

    it('should throw error for invalid import JSON', async () => {
      await expect(storageService.importData('invalid json{')).rejects.toThrow(StorageError);
      await expect(storageService.importData('invalid json{')).rejects.toThrow('Invalid JSON format');
    });

    it('should throw error for invalid import format', async () => {
      const invalidData = JSON.stringify({ notEntries: [] });
      await expect(storageService.importData(invalidData)).rejects.toThrow(StorageError);
      await expect(storageService.importData(invalidData)).rejects.toThrow('Invalid import format');
    });
  });

  describe('clearAll', () => {
    it('should clear all data from storage', async () => {
      const entry: Entry = {
        id: 'test-id',
        title: 'Test',
        date: '2024-01-01',
        content: 'Content',
        createdAt: Date.now(),
        lastModifiedAt: Date.now(),
        mood: null,
        tags: [],
        version: 1
      };

      await storageService.saveEntry(entry);
      await storageService.clearAll();

      const entries = await storageService.loadEntries();
      expect(entries).toEqual([]);
    });
  });
});
