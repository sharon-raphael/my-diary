import React, { useState, useEffect } from 'react';
import type { Entry } from '../types';
import { mediaService } from '../services/MediaService';

interface ListEntryThumbnailProps {
    entry: Entry;
}

export function ListEntryThumbnail({ entry }: ListEntryThumbnailProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        if (entry.media && entry.media.length > 0) {
            const imageMedia = entry.media.find(m => m.type === 'image') || entry.media[0];
            mediaService.getMediaUrl(imageMedia.id).then((url) => {
                if (active && url) {
                    setPreviewUrl(url);
                }
            });
        } else {
            setPreviewUrl(null);
        }
        return () => {
            active = false;
        };
    }, [entry]);

    if (!previewUrl) return null;

    return (
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <img
                src={previewUrl}
                alt="attachment"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </div>
    );
}
