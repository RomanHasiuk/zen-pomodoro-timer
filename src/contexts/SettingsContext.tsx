import { createContext, useContext, ReactNode } from 'react';
import { useSettings, type PomodoroSettings } from '../hooks/useSettings';

interface SettingsContextType {
  settings: PomodoroSettings;
  updateSettings: (key: keyof PomodoroSettings, value: any) => void;
  toggleMute: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { settings, updateSettings, toggleMute } = useSettings();

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleMute }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

