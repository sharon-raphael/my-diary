import { useState, useMemo, useEffect } from 'react';
import type { Entry } from '../types';
import { mediaService } from '../services/MediaService';
import { MOOD_OPTIONS } from './MoodSelector';
import './ReportsView.css';

interface ReportsViewProps {
  entries: Entry[];
}

export function ReportsView({ entries }: ReportsViewProps) {
  // Default to this month
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  });
  
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [mediaStorageSize, setMediaStorageSize] = useState<number>(0);
  const [mediaBreakdown, setMediaBreakdown] = useState<Record<string, number>>({ images: 0, videos: 0, others: 0 });
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('thisMonth');

  const setPresetRange = (preset: 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear') => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'thisWeek') {
      const day = today.getDay(); // 0 is Sunday, 1 is Monday...
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start = new Date(today.setDate(diff));
      end = new Date(); // Reset to actual today since we mutated today above
    } else if (preset === 'lastWeek') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7;
      start = new Date(today.getFullYear(), today.getMonth(), diff);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    } else if (preset === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
    } else if (preset === 'lastMonth') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset === 'thisYear') {
      start = new Date(today.getFullYear(), 0, 1);
      end = today;
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
        const breakdown = { images: 0, videos: 0, others: 0 };
        for (const entry of filteredEntries) {
          if (entry.media) {
            for (const m of entry.media) {
              const size = await mediaService.getMediaSize(m.id);
              total += size;
              if (m.type.startsWith('image/') || m.type === 'image') {
                breakdown.images += size;
              } else if (m.type.startsWith('video/') || m.type === 'video') {
                breakdown.videos += size;
              } else {
                breakdown.others += size;
              }
            }
          }
        }
        setMediaStorageSize(total);
        setMediaBreakdown(breakdown);
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

    const sortedActiveDates = Array.from(activeDates).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    
    for (let i = 0; i < sortedActiveDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        longestStreak = 1;
      } else {
        const prevDate = new Date(sortedActiveDates[i - 1]);
        const currDate = new Date(sortedActiveDates[i]);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
    }

    return {
      totalDays,
      activeDays: activeDates.size,
      missedDays,
      longestStreak,
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
            <div className="date-pickers">
              <div className="date-input-group">
                <label htmlFor="from-date">From</label>
                <input 
                  type="date" 
                  id="from-date" 
                  value={fromDate} 
                  onChange={e => {
                    setFromDate(e.target.value);
                    setSelectedPreset('');
                  }} 
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="to-date">To</label>
                <input 
                  type="date" 
                  id="to-date" 
                  value={toDate} 
                  onChange={e => {
                    setToDate(e.target.value);
                    setSelectedPreset('');
                  }} 
                />
              </div>
            </div>
            
            <div className="reports-presets">
              <label htmlFor="preset-select">Quick Filter</label>
              <select 
                id="preset-select"
                className="preset-dropdown" 
                value={selectedPreset} 
                required
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedPreset(e.target.value);
                    setPresetRange(e.target.value as any);
                  }
                }}
              >
                <option value="" disabled className="dropdown-placeholder">Select</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div>
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
            <div className="stat-badge streak">
              <span className="stat-value">{stats.longestStreak}</span>
              <span className="stat-label">Longest Streak</span>
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
              <span className="storage-label">Local storage used in this date range.</span>
            </div>
          </div>
          
          {!isLoadingMedia && mediaStorageSize > 0 && (
            <div className="storage-breakdown">
              {mediaBreakdown.images > 0 && (
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>🖼️ Images</span>
                    <span>{formatStorageSize(mediaBreakdown.images)}</span>
                  </div>
                  <div className="mood-bar-track">
                    <div 
                      className="mood-bar-fill" 
                      style={{ 
                        width: `${(mediaBreakdown.images / mediaStorageSize) * 100}%`, 
                        backgroundColor: '#3b82f6' 
                      }} 
                    />
                  </div>
                </div>
              )}
              {mediaBreakdown.videos > 0 && (
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>🎥 Videos</span>
                    <span>{formatStorageSize(mediaBreakdown.videos)}</span>
                  </div>
                  <div className="mood-bar-track">
                    <div 
                      className="mood-bar-fill" 
                      style={{ 
                        width: `${(mediaBreakdown.videos / mediaStorageSize) * 100}%`, 
                        backgroundColor: '#ec4899' 
                      }} 
                    />
                  </div>
                </div>
              )}
              {mediaBreakdown.others > 0 && (
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>📄 Files</span>
                    <span>{formatStorageSize(mediaBreakdown.others)}</span>
                  </div>
                  <div className="mood-bar-track">
                    <div 
                      className="mood-bar-fill" 
                      style={{ 
                        width: `${(mediaBreakdown.others / mediaStorageSize) * 100}%`, 
                        backgroundColor: '#8b5cf6' 
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
