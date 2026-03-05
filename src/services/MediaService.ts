import localforage from 'localforage';

/**
 * Service for handling local media storage using localforage.
 * Maps EntryMedia UUIDs to Blob files in IndexedDB safely.
 */
class MediaService {
    private mediaStore: LocalForage;

    constructor() {
        this.mediaStore = localforage.createInstance({
            name: 'my-diary',
            storeName: 'media',
            description: 'Blobs for journal entry media'
        });
    }

    /**
     * Save a blob with a given ID.
     */
    async saveMedia(id: string, blob: Blob): Promise<void> {
        try {
            await this.mediaStore.setItem(id, blob);
        } catch (error) {
            console.error('Failed to save media blob:', error);
            throw new Error('Failed to save media to IndexedDB');
        }
    }

    /**
     * Load a blob by its ID.
     */
    async loadMedia(id: string): Promise<Blob | null> {
        try {
            const blob = await this.mediaStore.getItem<Blob>(id);
            return blob || null;
        } catch (error) {
            console.error('Failed to load media blob:', error);
            return null;
        }
    }

    /**
     * Generates an ObjectURL for a given media ID.
     * Note: The caller MUST eventually call URL.revokeObjectURL on the returned string to avoid memory leaks!
     */
    async getMediaUrl(id: string): Promise<string | null> {
        const blob = await this.loadMedia(id);
        if (!blob) return null;
        return URL.createObjectURL(blob);
    }

    /**
     * Delete a blob by its ID.
     */
    async deleteMedia(id: string): Promise<void> {
        try {
            await this.mediaStore.removeItem(id);
        } catch (error) {
            console.error('Failed to delete media blob:', error);
        }
    }
}

export const mediaService = new MediaService();
