import React, { useRef } from 'react';

import './MediaUploader.css';
import { v4 as uuidv4 } from 'uuid';

export interface PendingMedia {
    id: string;   // Either an existing EntryMedia ID or a newly generated one
    type: 'image' | 'video';
    name: string;
    file?: File;  // Only defined for newly added media
    url?: string; // ObjectURL for previewing
}

interface MediaUploaderProps {
    media: PendingMedia[];
    onChange: (media: PendingMedia[]) => void;
}

export function MediaUploader({ media, onChange }: MediaUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const newMedia: PendingMedia[] = Array.from(e.target.files).map((file) => {
            const isVideo = file.type.startsWith('video/');
            return {
                id: uuidv4(),
                type: isVideo ? 'video' : 'image',
                name: file.name,
                file: file,
                url: URL.createObjectURL(file)
            };
        });

        onChange([...media, ...newMedia]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeMedia = (idToRemove: string) => {
        onChange(media.filter(m => m.id !== idToRemove));
    };

    return (
        <div className="media-uploader">
            <div className="media-header">
                <label>Attachments (Images/Videos)</label>
                <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Add Media
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>

            {media.length > 0 && (
                <div className="media-preview-list">
                    {media.map((item) => (
                        <div key={item.id} className="media-preview-item">
                            {item.type === 'image' ? (
                                <img src={item.url || '#'} alt={item.name} />
                            ) : (
                                <video src={item.url || '#'} muted />
                            )}
                            <div className="media-preview-overlay">
                                <span className="media-name" title={item.name}>
                                    {item.name}
                                </span>
                                <button
                                    type="button"
                                    className="btn-danger-icon"
                                    onClick={() => removeMedia(item.id)}
                                    aria-label="Remove media"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
