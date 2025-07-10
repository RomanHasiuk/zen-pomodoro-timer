// src/hooks/useTimer.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { type PomodoroSettings } from '../hooks/useSettings'; // Перевірте шлях
import { useAudio } from './useAudio';
import { useNotifications } from './useNotifications';
import TimerWorker from '../worker?worker'; // Перевірте шлях до worker.ts

export interface TimerState {
  currentTime: number;
  currentPhase: 'work' | 'rest' | 'longBreak';
  currentCycle: number;
  currentSet: number;
  isRunning: boolean;
  isFinished: boolean;
  totalElapsedSeconds: number;
}

export const useTimer = (settings: PomodoroSettings, initialState?: Partial<TimerState>) => {
  const { playNotificationSound, stopAndResetAllSounds } = useAudio(settings.volume);
  const { sendNotification, requestPermission, permission } = useNotifications();
  const workerRef = useRef<Worker | null>(null);

  const [timerState, setTimerState] = useState<TimerState>(() => ({
    currentTime: settings.workTime * 60 + settings.workSeconds,
    currentPhase: 'work',
    currentCycle: 1,
    currentSet: 1,
    isRunning: false,
    isFinished: false,
    totalElapsedSeconds: 0,
    ...initialState,
  }));

  const calculateInitialTotalTime = useCallback(() => {
    const workSec = settings.workTime * 60 + settings.workSeconds;
    const restSec = settings.restTime * 60 + settings.restSeconds;
    const longBreakSec = settings.longBreakTime * 60 + settings.longBreakSeconds;

    let totalSessionTime = 0;
    for (let s = 1; s <= settings.totalSets; s++) {
      for (let c = 1; c <= settings.workCycles; c++) {
        totalSessionTime += workSec;
        if (c < settings.workCycles) {
          totalSessionTime += restSec;
        }
      }
      if (s < settings.totalSets) {
        totalSessionTime += longBreakSec;
      }
    }
    return totalSessionTime;
  }, [settings]);

  const [initialTotalSessionTime, setInitialTotalSessionTime] = useState(calculateInitialTotalTime);

  useEffect(() => {
    setInitialTotalSessionTime(calculateInitialTotalTime());
  }, [calculateInitialTotalTime]);


  useEffect(() => {
    const worker = new TimerWorker();
    workerRef.current = worker;

    // Відправляємо налаштування одразу при ініціалізації воркера
    worker.postMessage({ command: 'init', settings, initialState });

    worker.onmessage = (e: MessageEvent) => {
      const { type, state, sound, title, options } = e.data; // Отримуємо також title та options для сповіщень

      if (type === 'update') {
        // Не порівнюємо oldPhase тут, оскільки воркер сам відправляє 'notify' коли фаза змінюється
        setTimerState(state);
      } else if (type === 'playSound') {
        playNotificationSound(sound);
      } else if (type === 'notify') { // Обробка нового типу повідомлення для сповіщень
        sendNotification(title, options);
      }
    };

    return () => {
      worker.terminate();
    };
  }, [settings, initialState, playNotificationSound, sendNotification]); // Додано sendNotification в залежності

  const toggleTimer = () => {
    if (permission === 'default') {
      requestPermission().then(newPermission => {
        if (newPermission === 'granted') {
          // Якщо дозвіл надано, тоді запускаємо/зупиняємо таймер
          if (timerState.isRunning) {
            workerRef.current?.postMessage({ command: 'stop' });
            playNotificationSound('pause');
          } else {
            const isInitialWorkStart =
              timerState.currentPhase === 'work' &&
              timerState.currentCycle === 1 &&
              timerState.currentSet === 1 &&
              timerState.currentTime === settings.workTime * 60 + settings.workSeconds;
            playNotificationSound(isInitialWorkStart ? 'startup' : 'unpause');
            setTimeout(() => {
              workerRef.current?.postMessage({ command: 'start', settings }); // Передаємо settings при старті
            }, 500);
          }
        }
      });
    } else if (permission === 'granted') {
      // Якщо дозвіл вже надано, просто запускаємо/зупиняємо таймер
      if (timerState.isRunning) {
        workerRef.current?.postMessage({ command: 'stop' });
        playNotificationSound('pause');
      } else {
        const isInitialWorkStart =
          timerState.currentPhase === 'work' &&
          timerState.currentCycle === 1 &&
          timerState.currentSet === 1 &&
          timerState.currentTime === settings.workTime * 60 + settings.workSeconds;
        playNotificationSound(isInitialWorkStart ? 'startup' : 'unpause');
        setTimeout(() => {
          workerRef.current?.postMessage({ command: 'start', settings }); // Передаємо settings при старті
        }, 500);
      }
    } else {
        // Якщо дозвіл відхилено, повідомте користувача або заблокуйте функціонал
        console.warn('Сповіщення заборонено. Таймер буде працювати без сповіщень.');
        // Продовжуємо логіку таймера без сповіщень
        if (timerState.isRunning) {
          workerRef.current?.postMessage({ command: 'stop' });
          playNotificationSound('pause');
        } else {
          const isInitialWorkStart =
            timerState.currentPhase === 'work' &&
            timerState.currentCycle === 1 &&
            timerState.currentSet === 1 &&
            timerState.currentTime === settings.workTime * 60 + settings.workSeconds;
          playNotificationSound(isInitialWorkStart ? 'startup' : 'unpause');
          setTimeout(() => {
            workerRef.current?.postMessage({ command: 'start', settings }); // Передаємо settings при старті
          }, 500);
        }
    }
  };

  const resetTimer = useCallback(() => {
    workerRef.current?.postMessage({ command: 'reset', settings });
    stopAndResetAllSounds();
  }, [settings, stopAndResetAllSounds]);

  const getTotalProgress = () => {
    if (initialTotalSessionTime === 0) return 0;
    return Math.min(100, (timerState.totalElapsedSeconds / initialTotalSessionTime) * 100);
  };

  return {
    ...timerState,
    toggleTimer,
    resetTimer,
    getTotalProgress,
  };
};
