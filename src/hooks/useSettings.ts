import { useState, useEffect, useRef } from 'react';

export interface PomodoroSettings {
  workTime: number;
  workSeconds: number;
  restTime: number;
  restSeconds: number;
  workCycles: number;
  longBreakTime: number;
  longBreakSeconds: number;
  totalSets: number;
  volume: number;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    const defaults: PomodoroSettings = {
      workTime: 45,
      workSeconds: 0,
      restTime: 5,
      restSeconds: 0,
      workCycles: 4,
      longBreakTime: 30,
      longBreakSeconds: 0,
      totalSets: 2,
      volume: 75,
    };

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.hasOwnProperty('soundEnabled')) {
        parsed.volume = parsed.soundEnabled ? 75 : 0;
        delete parsed.soundEnabled;
      }
      return { ...defaults, ...parsed };
    }
    return defaults;
  });

  const lastVolumeRef = useRef(settings.volume > 0 ? settings.volume : 75);

  useEffect(() => {
    if (settings.volume > 0) {
      lastVolumeRef.current = settings.volume;
    }
  }, [settings.volume]);

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (key: keyof PomodoroSettings, value: any) => {
    const numValue = parseInt(value, 10);

    if (isNaN(numValue)) {
      console.warn(`Invalid value for ${key}: ${value}. Must be a number.`);
      return;
    }

    if (key.includes("Seconds") && (numValue < 0 || numValue > 59)) {
      console.warn(`Invalid value for ${key}: ${value}. Must be between 0 and 59.`);
      return;
    }
    if (key === "volume" && (numValue < 0 || numValue > 100)) {
      console.warn(`Invalid value for ${key}: ${value}. Must be between 0 and 100.`);
      return;
    }

    setSettings((prev) => ({ ...prev, [key]: numValue }));
  };

  const toggleMute = () => {
    if (settings.volume > 0) {
      updateSettings('volume', 0);
    } else {
      updateSettings('volume', lastVolumeRef.current);
    }
  };

  return { settings, updateSettings, toggleMute };
};


