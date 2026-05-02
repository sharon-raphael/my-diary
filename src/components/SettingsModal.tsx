import React, { useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGoogleLogin } from '@react-oauth/google';
import { googleDriveService } from '../services/GoogleDriveService';
import './SettingsModal.css';

interface SettingsModalProps {
    onClose: () => void;
    onExport: () => void;
    onImport: (file: File) => void;
    onDeleteAll: () => void;
    generateExportZip: () => Promise<{ blob: Blob, filename: string }>;
}

export function SettingsModal({ onClose, onExport, onImport, onDeleteAll, generateExportZip }: SettingsModalProps) {
    const { isDarkMode, setIsDarkMode } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupMessage, setBackupMessage] = useState('');

    const handleGoogleDriveBackup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsBackingUp(true);
                setBackupMessage('Generating backup...');
                const { blob, filename } = await generateExportZip();
                
                setBackupMessage('Uploading to Google Drive...');
                await googleDriveService.uploadBackup(tokenResponse.access_token, blob, filename);
                
                setBackupMessage('Backup successful!');
                setTimeout(() => setBackupMessage(''), 3000);
            } catch (error) {
                console.error(error);
                setBackupMessage('Backup failed. See console.');
                setTimeout(() => setBackupMessage(''), 5000);
            } finally {
                setIsBackingUp(false);
            }
        },
        onError: error => {
            console.error('Login Failed', error);
            setBackupMessage('Google Login Failed');
            setTimeout(() => setBackupMessage(''), 3000);
        },
        scope: 'https://www.googleapis.com/auth/drive.file',
    });

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
                    <div className="settings-section">
                        <h3 className="settings-section-title">Appearance</h3>
                        <div className="settings-row">
                            <span>Dark Mode</span>
                            <label className="theme-switch">
                                <input 
                                    type="checkbox" 
                                    checked={isDarkMode} 
                                    onChange={(e) => setIsDarkMode(e.target.checked)} 
                                    aria-label="Toggle dark mode"
                                />
                                <span className="theme-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3 className="settings-section-title">Data Management</h3>
                        <button className="settings-action" onClick={() => { onExport(); onClose(); }}>
                            <span className="settings-action-icon">📤</span>
                            <span>Export Entries</span>
                        </button>
                        <button className="settings-action" onClick={() => handleGoogleDriveBackup()} disabled={isBackingUp}>
                            <span className="settings-action-icon">☁️</span>
                            <span>{isBackingUp ? backupMessage : 'Backup to Google Drive'}</span>
                        </button>
                        {backupMessage && !isBackingUp && <div className="backup-message">{backupMessage}</div>}
                    <button className="settings-action" onClick={handleImportClick}>
                        <span className="settings-action-icon">📥</span>
                        <span>Import Entries</span>
                    </button>
                    <button className="settings-action delete-action" onClick={() => {
                        if (window.confirm("Are you sure you want to delete all entries? This action cannot be undone.")) {
                            onDeleteAll();
                            onClose();
                        }
                    }}>
                        <span className="settings-action-icon">🗑️</span>
                        <span style={{ color: '#dc3545' }}>Delete All Entries</span>
                    </button>
                    </div>

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
