import { useMemo, useCallback, useEffect } from 'react';

// Define the keys for the audio types for better type safety
export type AudioType =
  | 'workStart'
  | 'restStart'
  | 'longBreak'
  | 'complete'
  | 'startup'
  | 'workWarning'
  | 'restWarning'
  | 'pause'
  | 'unpause';

export const useAudio = (volume: number) => {
  // Use useMemo to create the Audio objects only once.
  const audioMap = useMemo(() => ({
    workStart: new Audio('/sounds/work_start.mp3'),
    restStart: new Audio('/sounds/rest_start.mp3'),
    longBreak: new Audio('/sounds/long_break.mp3'),
    complete: new Audio('/sounds/finish.mp3'),
    startup: new Audio('/sounds/startup.mp3'),
    workWarning: new Audio('/sounds/work_warning.mp3'),
    restWarning: new Audio('/sounds/rest_warning.mp3'),
    pause: new Audio('/sounds/pause.mp3'),
    unpause: new Audio('/sounds/unpause.mp3'),
  }), []);

  // Effect to update the volume on all audio elements whenever it changes
  useEffect(() => {
    const newVolume = Math.max(0, Math.min(1, volume / 100));
    Object.values(audioMap).forEach(audio => {
      audio.volume = newVolume;
    });
  }, [volume, audioMap]);

  const stopAndResetAllSounds = useCallback(() => {
    Object.values(audioMap).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, [audioMap]);

  const playNotificationSound = useCallback(
    (type: AudioType) => {
      // Sound is played if volume is greater than 0
      if (volume === 0) return;

      stopAndResetAllSounds();
      const audio = audioMap[type];
      if (audio) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error(`Audio play failed for type "${type}":`, error);
          });
        }
      }
    },
    [volume, audioMap, stopAndResetAllSounds]
  );

  return { playNotificationSound, stopAndResetAllSounds };
};
