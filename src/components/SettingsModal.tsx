import React from 'react';
import type { PomodoroSettings } from '../hooks/useSettings';

interface SettingsModalProps {
  settings: PomodoroSettings;
  updateSettings: (key: keyof PomodoroSettings, value: any) => void;
  toggleMute: () => void;
  applySettings: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, updateSettings, toggleMute, applySettings, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full shadow-2xl border border-white/20 relative">
        <h3 className="text-lg font-semibold text-white mb-4">
          Налаштування / Settings
        </h3>

        <div className="space-y-4">
          {/* Input fields remain the same */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-white/80 text-sm mb-1 h-8 flex items-center">
                Час роботи (хв.) / Work Time (min)
              </label>
              <input
                type="number"
                min="0"
                value={settings.workTime}
                onChange={(e) => updateSettings("workTime", e.target.value)}
                className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-1 h-8 flex items-center">
                Секунди / Seconds
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={settings.workSeconds}
                onChange={(e) =>
                  updateSettings("workSeconds", e.target.value)
                }
                className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-white/80 text-sm mb-1 h-8 flex items-center">
                Час відпочинку (хв.) / Rest Time (min)
              </label>
              <input
                type="number"
                min="0"
                value={settings.restTime}
                onChange={(e) => updateSettings("restTime", e.target.value)}
                className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-1 h-8 flex items-center">
                Секунди / Seconds
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={settings.restSeconds}
                onChange={(e) =>
                  updateSettings("restSeconds", e.target.value)
                }
                className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-white/80 text-sm mb-1 h-8 flex items-center">
                Довга перерва (хв.) / Long Break (min)
              </label>
              <input
                type="number"
                min="0"
                value={settings.longBreakTime}
                onChange={(e) =>
                  updateSettings("longBreakTime", e.target.value)
                }
                className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm mb-1 h-8 flex items-center">
                Секунди / Seconds
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={settings.longBreakSeconds}
                onChange={(e) =>
                  updateSettings("longBreakSeconds", e.target.value)
                }
                className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-1 h-8 flex items-center">
              Робочих циклів в сеті / Work Cycles per Set
            </label>
            <input
              type="number"
              min="1"
              value={settings.workCycles}
              onChange={(e) =>
                updateSettings("workCycles", e.target.value)
              }
              className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-1 h-8 flex items-center">
              Загальна кількість сетів / Total Sets
            </label>
            <input
              type="number"
              min="1"
              value={settings.totalSets}
              onChange={(e) =>
                updateSettings("totalSets", e.target.value)
              }
              className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2 text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-white/80 text-sm">
              Вимкнути звук / Mute
            </label>
            <button
              onClick={toggleMute}
              className={`relative inline-flex h-6 w-11 items-center rounded-md transition-colors ${
                settings.volume > 0 ? "bg-white/20" : "bg-black/40"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-sm bg-black transition-transform ${
                  settings.volume > 0
                    ? "translate-x-6 bg-white/40"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={applySettings}
          className="w-full mt-6 bg-white/3 hover:bg-white/10 text-white py-2 px-4 rounded-md transition-colors"
        >
          Застосувати / Apply
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 bg-red-500/30 hover:bg-red-500/50 text-white py-2 px-4 rounded-md transition-colors"
        >
          Закрити / Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;

