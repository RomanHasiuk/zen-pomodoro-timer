import { useState, useEffect, useRef, useCallback } from 'react';
import { type PomodoroSettings } from './useSettings';
import { useAudio, type AudioType } from './useAudio';

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

  const [isRunning, setIsRunning] = useState(initialState?.isRunning ?? false);
  const [currentTime, setCurrentTime] = useState(initialState?.currentTime ?? settings.workTime * 60 + settings.workSeconds);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'rest' | 'longBreak'>(initialState?.currentPhase ?? 'work');
  const [currentCycle, setCurrentCycle] = useState(initialState?.currentCycle ?? 1);
  const [currentSet, setCurrentSet] = useState(initialState?.currentSet ?? 1);
  const [isFinished, setIsFinished] = useState(initialState?.isFinished ?? false);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(initialState?.totalElapsedSeconds ?? 0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


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

  const handlePhaseComplete = useCallback(() => {
    if (isFinished) return; // Do nothing if the session is already finished
    if (currentPhase === 'work') {
      if (currentCycle === settings.workCycles && currentSet === settings.totalSets) {
        setIsRunning(false);
        playNotificationSound('complete');
        setIsFinished(true);
      } else if (currentCycle < settings.workCycles) {
        setCurrentPhase('rest');
        setCurrentTime(settings.restTime * 60 + settings.restSeconds);
        playNotificationSound('restStart');
      } else {
        setCurrentPhase('longBreak');
        setCurrentTime(settings.longBreakTime * 60 + settings.longBreakSeconds);
        playNotificationSound('longBreak');
      }
    } else if (currentPhase === 'rest') {
      // Next work cycle / Наступний робочий цикл
      setCurrentCycle((prev) => prev + 1);
      setCurrentPhase('work');
      setCurrentTime(settings.workTime * 60 + settings.workSeconds);
      playNotificationSound('workStart');
    } else if (currentPhase === 'longBreak') {
      if (currentSet < settings.totalSets) {
        // Next set / Наступний сет
        setCurrentSet((prev) => prev + 1);
        setCurrentCycle(1);
        setCurrentPhase('work');
        setCurrentTime(settings.workTime * 60 + settings.workSeconds);
        playNotificationSound('workStart');
      } else {
        setIsRunning(false);
        playNotificationSound('complete');
        setIsFinished(true);
      }
    }
  }, [currentPhase, currentCycle, currentSet, settings, playNotificationSound]);

  useEffect(() => {
    clearInterval(intervalRef.current!);
    clearTimeout(timeoutRef.current!);

    if (isRunning && currentTime > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev - 1;
          setTotalElapsedSeconds((prevTotal) => prevTotal + 1);

          const WARNING_THRESHOLD_SECONDS = 5;
          if (newTime === WARNING_THRESHOLD_SECONDS && newTime > 0) {
            playNotificationSound(currentPhase === 'work' ? 'workWarning' : 'restWarning');
          }
          return newTime;
        });
      }, 1000);
    } else if (currentTime === 0) {
      handlePhaseComplete();
    }

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [isRunning, currentTime, handlePhaseComplete, playNotificationSound, currentPhase]);

  const toggleTimer = () => {
    if (!isRunning) {
      const isInitialWorkStart =
        currentPhase === 'work' &&
        currentCycle === 1 &&
        currentSet === 1 &&
        currentTime === settings.workTime * 60 + settings.workSeconds;

      playNotificationSound(isInitialWorkStart ? 'startup' : 'unpause');

      timeoutRef.current = setTimeout(() => {
        setIsRunning(true);
      }, 500);
    } else {
      setIsRunning(false);
      playNotificationSound('pause');
      clearTimeout(timeoutRef.current!);
    }
  };

  const resetTimer = useCallback(() => {
    setCurrentTime(settings.workTime * 60 + settings.workSeconds);
    setCurrentPhase('work');
    setCurrentCycle(1);
    setCurrentSet(1);
    setIsRunning(false);
    setIsFinished(false);
    setTotalElapsedSeconds(0);
    stopAndResetAllSounds();
    clearInterval(intervalRef.current!);
    clearTimeout(timeoutRef.current!);
  }, [settings, stopAndResetAllSounds]);

  const getTotalProgress = () => {
    if (initialTotalSessionTime === 0) return 0;
    return Math.min(100, (totalElapsedSeconds / initialTotalSessionTime) * 100);
  };

  return {
    currentTime,
    currentPhase,
    currentCycle,
    currentSet,
    isRunning,
    isFinished,
    totalElapsedSeconds,
    toggleTimer,
    resetTimer,
    getTotalProgress,
  };
};
