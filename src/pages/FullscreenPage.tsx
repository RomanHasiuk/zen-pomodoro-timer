// src/pages/FullscreenPage.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettingsContext } from "../contexts/SettingsContext";
import { useTimer, type TimerState } from "../hooks/useTimer";
import TimerControls from "../components/TimerControls";
import SettingsModal from "../components/SettingsModal";
import { ChevronLeft, Lock, Unlock, Dumbbell, Coffee, Donut } from "lucide-react";
import Button from "../components/Button";
import TimerDisplay from "../components/TimerDisplay";

const FullscreenPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, updateSettings, toggleMute } = useSettingsContext();

  const timerState = useTimer(settings, location.state as TimerState);
  const {
    currentTime,
    currentPhase,
    isRunning,
    isFinished,
    toggleTimer,
    resetTimer,
  } = timerState;

  const [showSettings, setShowSettings] = useState(false);
  const [isVolumeSliderVisible, setVolumeSliderVisible] = useState(false);
  const [showControls, setShowControls] = useState(true); // Стан для видимості елементів керування
  const [isLocked, setIsLocked] = useState(false); // Стан для блокування кнопок

  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ОНОВЛЕНО: handleActivity тепер завжди показує елементи керування та скидає таймер
  const handleActivity = useCallback(() => {
    setShowControls(true); // Завжди показувати елементи керування при активності
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    activityTimeoutRef.current = setTimeout(() => setShowControls(false), 3000); // Приховати через 3 секунди бездіяльності
  }, []); // Залежності порожні, оскільки setShowControls є стабільною функцією

  useEffect(() => {
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('keydown', handleActivity); // Додаємо слухач для клавіатури
    handleActivity(); // Початковий виклик для встановлення видимості та таймера
    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    };
  }, [handleActivity]); // handleActivity є стабільною завдяки useCallback

  const handleVolumeChange = (newVolume: number) => {
    updateSettings("volume", newVolume);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => setVolumeSliderVisible(false), 3000);
  };

  const toggleVolumeSlider = () => {
    setVolumeSliderVisible(prev => !prev);
  };

  useEffect(() => {
    if (isVolumeSliderVisible) {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = setTimeout(() => setVolumeSliderVisible(false), 3000);
    }
  }, [isVolumeSliderVisible]);

  const applySettings = () => {
    setShowSettings(false);
    resetTimer();
  };

  // ОНОВЛЕНО: toggleLock лише перемикає isLocked і потім викликає handleActivity
  const toggleLock = () => {
    setIsLocked(prev => !prev);
    handleActivity(); // Викликаємо handleActivity, щоб елементи керування з'явилися і таймер скинувся
  };

  const handleMainClick = () => {
    if (!isLocked) { // Клік по таймеру працює лише, якщо не заблоковано
      toggleTimer();
    }
  };

  const handleExitFullscreen = () => {
    const stateToPass: TimerState = {
      currentTime,
      currentPhase,
      currentCycle: timerState.currentCycle,
      currentSet: timerState.currentSet,
      isRunning,
      isFinished,
      totalElapsedSeconds: timerState.totalElapsedSeconds,
    };
    navigate('/', { state: stateToPass });
  };

  return (
    <div className=" bg-black">
      <div className="min-h-screen w-screen bg-white/10 flex flex-col items-center justify-center p-4 my-font relative overflow-hidden">
        {/* Верхні елементи керування */}
        {/* Видимість контролюється showControls */}
        <div className={`absolute top-4 w-full flex justify-between items-start px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Button
            onClick={handleExitFullscreen}
            disabled={isLocked} // Кнопка виходу заблокована, якщо увімкнено блокування
          >
            <ChevronLeft size={24} />
          </Button>

          <div className="flex flex-col items-center gap-4">
            <TimerControls
              isRunning={isRunning}
              volume={settings.volume}
              isVolumeSliderVisible={isVolumeSliderVisible}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              onVolumeChange={handleVolumeChange}
              toggleVolumeSlider={toggleVolumeSlider}
              onGoFullscreen={handleExitFullscreen}
              onShowSettings={() => setShowSettings(true)}
              isLocked={isLocked} // Передаємо стан блокування до TimerControls
              isFullscreen={true}
            />
          </div>
        </div>

        {/* Основний дисплей таймера */}
        <div
          className="flex justify-center items-center h-full w-[80vw] gap-2 md:gap-4 lg:gap-6"
          onClick={handleMainClick} // Клік по таймеру обробляється handleMainClick
        >
          <TimerDisplay
            currentTime={currentTime}
            isFinished={isFinished}
            onDoubleClick={handleMainClick} // Подвійний клік по таймеру також обробляється handleMainClick
            className="text-8xl md:text-[12rem] lg:text-[18rem]"
          />
        </div>

        {/* Іконки фаз */}
        <div className="absolute bottom-40 w-full flex justify-center">
          <div className="relative h-8 w-8 shadow-lg text-[#f56262]/50">
            <span
              className={
                `absolute inset-0 flex items-center justify-center ${currentPhase !== 'work' && 'hidden'}`
              }
            >
              <Dumbbell size={28} />
            </span>

            <span
              className={
                `absolute inset-0 flex items-center justify-center ${currentPhase !== 'rest' && 'hidden'}`
              }
            >
              <Coffee size={28} />
            </span>

            <span
              className={
                `absolute inset-0 flex items-center justify-center ${currentPhase !== 'longBreak' && 'hidden'}`
              }
            >
              <Donut size={28} />
            </span>
          </div>
        </div>

        {/* Кнопка блокування */}
        {/* Видимість контролюється showControls, але сама кнопка ніколи не disabled */}
        <div className={`absolute bottom-4 right-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            onClick={toggleLock}
            // Кнопка блокування ніколи не повинна бути disabled, щоб можна було її зняти
          >
            {isLocked ? <Lock size={24} /> : <Unlock size={24} />}
          </Button>
        </div>

        {/* Модальне вікно налаштувань */}
        {showSettings && (
          <SettingsModal
            settings={settings}
            updateSettings={updateSettings}
            toggleMute={toggleMute}
            applySettings={applySettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default FullscreenPage;
