import React, { useRef } from 'react';
import './SettingsModal.css';

interface SettingsModalProps {
    onClose: () => void;
    onExport: () => void;
    onImport: (file: File) => void;
}

export function SettingsModal({ onClose, onExport, onImport }: SettingsModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
            e.target.value = '';
            onClose();
        }
    };

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="close-settings" onClick={onClose}>&times;</button>
                </div>
                <div className="settings-content">
                    <button className="settings-action" onClick={() => { onExport(); onClose(); }}>
                        <span className="settings-action-icon">📤</span>
                        <span>Export Entries</span>
                    </button>
                    <button className="settings-action" onClick={handleImportClick}>
                        <span className="settings-action-icon">📥</span>
                        <span>Import Entries</span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.zip"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        aria-label="Select file to import"
                    />
                </div>
            </div>
        </div>
    );
}
