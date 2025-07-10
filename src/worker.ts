// src/worker.ts

// Імпортуємо тип PomodoroSettings, якщо він доступний глобально або через відносний шлях
// Припустимо, що PomodoroSettings знаходиться в contexts/SettingsContext.ts
import { type PomodoroSettings } from './hooks/useSettings'; // Шлях може відрізнятися
// Або визначте його тут, якщо це єдине місце використання:
// interface PomodoroSettings {
//   workTime: number;
//   workSeconds: number;
//   restTime: number;
//   restSeconds: number;
//   longBreakTime: number;
//   longBreakSeconds: number;
//   workCycles: number;
//   totalSets: number;
//   autoStartWork: boolean;
//   autoStartRest: boolean;
//   notifications: boolean;
//   volume: number;
// }

// Визначте інтерфейс TimerState, який ви вже маєте в useTimer.ts
interface TimerState {
  currentTime: number;
  currentPhase: 'work' | 'rest' | 'longBreak';
  currentCycle: number;
  currentSet: number;
  isRunning: boolean;
  isFinished: boolean;
  totalElapsedSeconds: number;
}

let timerId: NodeJS.Timeout | null = null;
let settings: PomodoroSettings | null = null; // Використовуємо PomodoroSettings
let state: TimerState | null = null; // Використовуємо TimerState

const tick = () => {
  if (!state || !settings) return;

  if (state.currentTime > 0) {
    state.currentTime -= 1;
    state.totalElapsedSeconds += 1;

    const WARNING_THRESHOLD_SECONDS = 5;
    if (state.currentTime === WARNING_THRESHOLD_SECONDS && state.currentTime > 0) {
      self.postMessage({ type: 'playSound', sound: state.currentPhase === 'work' ? 'workWarning' : 'restWarning' });
    }
  }

  if (state.currentTime <= 0) {
    handlePhaseComplete();
  }

  self.postMessage({ type: 'update', state });
};

const handlePhaseComplete = () => {
  if (!state || !settings) return;

  if (state.isFinished) {
    if (timerId) clearInterval(timerId);
    return;
  }

  if (state.currentPhase === 'work') {
    if (state.currentCycle === settings.workCycles && state.currentSet === settings.totalSets) {
      state.isRunning = false;
      state.isFinished = true;
      self.postMessage({ type: 'playSound', sound: 'complete' });
      // Додаємо сповіщення про завершення таймера
      self.postMessage({ type: 'notify', title: 'Помодоро завершено!', options: { body: 'Вся сесія помодоро завершена.' } });
    } else if (state.currentCycle < settings.workCycles) {
      state.currentPhase = 'rest';
      state.currentTime = settings.restTime * 60 + settings.restSeconds;
      self.postMessage({ type: 'playSound', sound: 'restStart' });
      self.postMessage({ type: 'notify', title: 'Час відпочити!', options: { body: `Починається ${state.currentCycle}-й цикл відпочинку.` } });
    } else {
      state.currentPhase = 'longBreak';
      state.currentTime = settings.longBreakTime * 60 + settings.longBreakSeconds;
      self.postMessage({ type: 'playSound', sound: 'longBreak' });
      self.postMessage({ type: 'notify', title: 'Велика перерва!', options: { body: `Починається велика перерва після ${state.currentCycle} циклів роботи.` } });
    }
  } else if (state.currentPhase === 'rest') {
    state.currentCycle += 1;
    state.currentPhase = 'work';
    state.currentTime = settings.workTime * 60 + settings.workSeconds;
    self.postMessage({ type: 'playSound', sound: 'workStart' });
    self.postMessage({ type: 'notify', title: 'Час працювати!', options: { body: `Починається ${state.currentCycle}-й цикл роботи.` } });
  } else if (state.currentPhase === 'longBreak') {
    if (state.currentSet < settings.totalSets) {
      state.currentSet += 1;
      state.currentCycle = 1;
      state.currentPhase = 'work';
      state.currentTime = settings.workTime * 60 + settings.workSeconds;
      self.postMessage({ type: 'playSound', sound: 'workStart' });
      self.postMessage({ type: 'notify', title: 'Час працювати!', options: { body: `Починається новий сет, ${state.currentCycle}-й цикл роботи.` } });
    } else {
      state.isRunning = false;
      state.isFinished = true;
      self.postMessage({ type: 'playSound', sound: 'complete' });
      self.postMessage({ type: 'notify', title: 'Помодоро завершено!', options: { body: 'Вся сесія помодоро завершена.' } });
    }
  }
  self.postMessage({ type: 'update', state });
};

self.onmessage = (e: MessageEvent) => {
  const { command, settings: newSettings, initialState } = e.data;

  // Завжди оновлюємо налаштування, якщо вони надіслані
  if (newSettings) {
    settings = newSettings;
  }

  switch (command) {
    case 'start':
      // Якщо стан не ініціалізовано, ініціалізуємо його з поточними налаштуваннями
      if (!state && settings) { // Перевірка, що settings існують
        state = {
          currentTime: settings.workTime * 60 + settings.workSeconds,
          currentPhase: 'work',
          currentCycle: 1,
          currentSet: 1,
          isRunning: false,
          isFinished: false,
          totalElapsedSeconds: 0,
          ...initialState,
        };
      }
      if (state && !state.isRunning) { // Перевірка, що state існують
        state.isRunning = true;
        if (timerId) clearInterval(timerId);
        timerId = setInterval(tick, 1000);
      }
      // Відправка початкового стану при старті (якщо він змінився)
      if (state) self.postMessage({ type: 'update', state });
      break;
    case 'stop':
      if (state) {
        state.isRunning = false;
      }
      if (timerId) clearInterval(timerId);
      timerId = null;
      if (state) self.postMessage({ type: 'update', state }); // Відправка оновленого стану
      break;
    case 'reset':
      if (timerId) clearInterval(timerId);
      timerId = null;
      if (settings) { // Перевірка, що settings існують
        state = {
          currentTime: settings.workTime * 60 + settings.workSeconds,
          currentPhase: 'work',
          currentCycle: 1,
          currentSet: 1,
          isRunning: false,
          isFinished: false,
          totalElapsedSeconds: 0,
        };
      } else {
        // Fallback for when settings are not yet loaded (should not happen with 'init')
        state = {
          currentTime: 0, currentPhase: 'work', currentCycle: 1, currentSet: 1,
          isRunning: false, isFinished: false, totalElapsedSeconds: 0
        }
      }
      self.postMessage({ type: 'update', state });
      break;
    case 'init':
      // Ініціалізація або оновлення налаштувань та стану
      if (newSettings) {
        settings = newSettings;
      }
      if (settings) {
        state = {
          currentTime: settings.workTime * 60 + settings.workSeconds,
          currentPhase: 'work',
          currentCycle: 1,
          currentSet: 1,
          isRunning: false,
          isFinished: false,
          totalElapsedSeconds: 0,
          ...initialState,
        };
      }
      self.postMessage({ type: 'update', state });
      break;
  }
};
