import type { Mood, MoodOption } from '../types';
import './MoodSelector.css';

interface MoodSelectorProps {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
}

/**
 * Mood options with display properties
 */
const MOOD_OPTIONS: MoodOption[] = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: '#FFD700' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: '#4682B4' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: '#FF6347' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: '#9370DB' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: '#87CEEB' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: '#FFB6C1' },
  { value: 'reflective', label: 'Reflective', emoji: '🤔', color: '#DDA0DD' },
  { value: 'energetic', label: 'Energetic', emoji: '⚡', color: '#FFA500' }
];

/**
 * Mood selector component
 */
export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="mood-selector">
      <label className="mood-label">Mood</label>
      <div className="mood-options">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`mood-option ${value === option.value ? 'selected' : ''}`}
            onClick={() => onChange(value === option.value ? null : option.value)}
            style={{ borderColor: value === option.value ? option.color : undefined }}
            title={option.label}
            aria-label={`Select ${option.label} mood`}
            aria-pressed={value === option.value}
          >
            <span className="mood-emoji">{option.emoji}</span>
            <span className="mood-label-text">{option.label}</span>
          </button>
        ))}
      </div>
      {value && (
        <button
          type="button"
          className="mood-clear"
          onClick={() => onChange(null)}
          aria-label="Clear mood"
        >
          Clear mood
        </button>
      )}
    </div>
  );
}

/**
 * Get mood option by value
 */
export function getMoodOption(mood: Mood): MoodOption | undefined {
  return MOOD_OPTIONS.find((option) => option.value === mood);
}

export { MOOD_OPTIONS };
