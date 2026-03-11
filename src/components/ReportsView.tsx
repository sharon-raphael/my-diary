import { useState, useMemo, useEffect } from 'react';
import type { Entry } from '../types';
import { mediaService } from '../services/MediaService';
import { MOOD_OPTIONS } from './MoodSelector';
import './ReportsView.css';

interface ReportsViewProps {
  entries: Entry[];
}

export function ReportsView({ entries }: ReportsViewProps) {
  // Default to the last 30 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [mediaStorageSize, setMediaStorageSize] = useState<number>(0);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const setPresetRange = (preset: 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear') => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'last30') {
      start.setDate(today.getDate() - 30);
      end = today;
    } else if (preset === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset === 'lastMonth') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset === 'thisYear') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    } else if (preset === 'lastYear') {
      start = new Date(today.getFullYear() - 1, 0, 1);
      end = new Date(today.getFullYear() - 1, 11, 31);
    }

    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFromDate(format(start));
    setToDate(format(end));
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Entry dates are YYYY-MM-DD strings
      return entry.date >= fromDate && entry.date <= toDate;
    });
  }, [entries, fromDate, toDate]);

  useEffect(() => {
    const calculateStorage = async () => {
      setIsLoadingMedia(true);
      try {
        let total = 0;
        for (const entry of filteredEntries) {
          if (entry.media) {
            for (const m of entry.media) {
              const size = await mediaService.getMediaSize(m.id);
              total += size;
            }
          }
        }
        setMediaStorageSize(total);
      } finally {
        setIsLoadingMedia(false);
      }
    };
    calculateStorage();
  }, [filteredEntries]);

  const stats = useMemo(() => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    // Add time offset logic so difference handles simple days strictly
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const msPerDay = 1000 * 60 * 60 * 24;
    // Calculation includes bounds 
    const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1);

    const activeDates = new Set<string>();
    const moodCounts: Record<string, number> = {};

    let totalEntriesCount = 0;

    filteredEntries.forEach(entry => {
      activeDates.add(entry.date);
      totalEntriesCount++;
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    const missedDays = Math.max(0, totalDays - activeDates.size);

    return {
      totalDays,
      activeDays: activeDates.size,
      missedDays,
      totalEntriesCount,
      moodCounts
    };
  }, [filteredEntries, fromDate, toDate]);

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="reports-view">
      <header className="reports-header">
        <h2 className="reports-title">My Reports</h2>
        <div className="reports-controls">
          <div className="reports-filters">
            <div className="date-input-group">
              <label htmlFor="from-date">From</label>
              <input 
                type="date" 
                id="from-date" 
                value={fromDate} 
                onChange={e => setFromDate(e.target.value)} 
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="to-date">To</label>
              <input 
                type="date" 
                id="to-date" 
                value={toDate} 
                onChange={e => setToDate(e.target.value)} 
              />
            </div>
          </div>
          <div className="reports-presets">
            <button className="preset-btn" onClick={() => setPresetRange('last30')}>Last 30 Days</button>
            <button className="preset-btn" onClick={() => setPresetRange('thisMonth')}>This Month</button>
            <button className="preset-btn" onClick={() => setPresetRange('lastMonth')}>Last Month</button>
            <button className="preset-btn" onClick={() => setPresetRange('thisYear')}>This Year</button>
            <button className="preset-btn" onClick={() => setPresetRange('lastYear')}>Last Year</button>
          </div>
        </div>
      </header>

      <div className="reports-grid">
        <div className="report-card stat-card">
          <h3>Consistency</h3>
          <div className="stat-badges">
            <div className="stat-badge total">
              <span className="stat-value">{stats.totalDays}</span>
              <span className="stat-label">Total Days</span>
            </div>
            <div className="stat-badge active">
              <span className="stat-value">{stats.activeDays}</span>
              <span className="stat-label">Active Days</span>
            </div>
            <div className="stat-badge missed">
              <span className="stat-value">{stats.missedDays}</span>
              <span className="stat-label">Missed Days</span>
            </div>
          </div>
          <div className="stat-summary">
            You wrote <strong>{stats.totalEntriesCount}</strong> entries in {stats.totalDays} days.
          </div>
        </div>

        <div className="report-card mood-card">
          <h3>Mood Distribution</h3>
          {Object.keys(stats.moodCounts).length === 0 ? (
            <p className="no-data">No mood data available for this range.</p>
          ) : (
            <div className="mood-bars">
              {MOOD_OPTIONS.filter(opt => stats.moodCounts[opt.value]).map(option => {
                const count = stats.moodCounts[option.value];
                const percentage = Math.round((count / stats.totalEntriesCount) * 100);
                return (
                  <div className="mood-bar-item" key={option.value}>
                    <div className="mood-bar-label">
                      <span>{option.emoji} {option.label}</span>
                      <span>{count}</span>
                    </div>
                    <div className="mood-bar-track">
                      <div 
                        className="mood-bar-fill" 
                        style={{ width: `${percentage}%`, backgroundColor: option.color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="report-card storage-card">
          <h3>Media Storage</h3>
          <div className="storage-info">
            <span className="storage-icon">🗄️</span>
            <div className="storage-details">
              <span className="storage-value">
                {isLoadingMedia ? 'Calculating...' : formatStorageSize(mediaStorageSize)}
              </span>
              <span className="storage-label">Local storage used by media (images/videos) in this date range.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
