import { useState, useEffect } from 'react';
import type { Entry } from '../types';
import { mediaService } from '../services/MediaService';
import './GalleryView.css';

interface GalleryItem {
    id: string;
    entryId: string;
    type: string;
    name: string;
    url: string;
    date: Date;
    size: number;
}

interface GalleryViewProps {
    entries: Entry[];
}

export function GalleryView({ entries }: GalleryViewProps) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'size-desc' | 'size-asc'>('date-desc');

    useEffect(() => {
        let active = true;
        let urlsToRevoke: string[] = [];

        const loadMediaInfo = async () => {
            setLoading(true);
            const loadedItems: GalleryItem[] = [];

            for (const entry of entries) {
                if (entry.media && entry.media.length > 0) {
                    for (const m of entry.media) {
                        const blob = await mediaService.loadMedia(m.id);
                        if (blob && active) {
                            const url = URL.createObjectURL(blob);
                            urlsToRevoke.push(url);
                            loadedItems.push({
                                id: m.id,
                                entryId: entry.id,
                                type: m.type,
                                name: m.name,
                                url,
                                date: new Date(entry.createdAt),
                                size: blob.size,
                            });
                        }
                    }
                }
            }

            if (active) {
                setItems(loadedItems);
                setLoading(false);
            }
        };

        loadMediaInfo();

        return () => {
            active = false;
            urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
        };
    }, [entries]);

    const sortedItems = [...items].sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.getTime() - a.date.getTime();
        if (sortBy === 'date-asc') return a.date.getTime() - b.date.getTime();
        if (sortBy === 'size-desc') return b.size - a.size;
        if (sortBy === 'size-asc') return a.size - b.size;
        return 0;
    });

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="gallery-view">
            <div className="gallery-header-container">
                <h2 className="gallery-title">Media Gallery</h2>
                <div className="gallery-controls">
                    <label htmlFor="gallery-sort" className="gallery-sort-label">Sort By:</label>
                    <select
                        id="gallery-sort"
                        className="gallery-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        aria-label="Sort media"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="size-desc">Largest Size</option>
                        <option value="size-asc">Smallest Size</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="gallery-loading">
                    <p>Loading media...</p>
                </div>
            ) : sortedItems.length === 0 ? (
                <div className="gallery-empty">
                    <p>No media attached to any entries.</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {sortedItems.map(item => (
                        <div key={item.id} className="gallery-card">
                            <div className="gallery-media-container">
                                {item.type.startsWith('image/') || item.type === 'image' ? (
                                    <img src={item.url} alt={item.name} loading="lazy" />
                                ) : item.type.startsWith('video/') || item.type === 'video' ? (
                                    <video src={item.url} controls preload="metadata" />
                                ) : (
                                    <div className="gallery-file-placeholder">📄 {item.name}</div>
                                )}
                            </div>
                            <div className="gallery-info">
                                <span className="gallery-date">{formatDate(item.date)}</span>
                                <span className="gallery-size">{formatSize(item.size)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
