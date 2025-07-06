import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettingsContext } from "../contexts/SettingsContext";
import { useTimer, type TimerState } from "../hooks/useTimer";
import TimerDisplay from "../components/TimerDisplay";
import TimerControls from "../components/TimerControls";
import ProgressBar from "../components/ProgressBar";
import SettingsModal from "../components/SettingsModal";

const phaseNames = {
  work: "Робота",
  rest: "Відпочинок",
  longBreak: "Довга перерва",
};

const TimerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, updateSettings, toggleMute } = useSettingsContext();
  
  const timerState = useTimer(settings, location.state as TimerState);
  const {
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
  } = timerState;

  const [showSettings, setShowSettings] = useState(false);
  const [isVolumeSliderVisible, setVolumeSliderVisible] = useState(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVolumeChange = (newVolume: number) => {
    updateSettings("volume", newVolume);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => {
      setVolumeSliderVisible(false);
    }, 3000);
  };

  const toggleVolumeSlider = () => {
    setVolumeSliderVisible(prev => !prev);
  };

  useEffect(() => {
    if (isVolumeSliderVisible) {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = setTimeout(() => {
        setVolumeSliderVisible(false);
      }, 3000);
    }
    return () => {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    };
  }, [isVolumeSliderVisible]);

  const handleGoFullscreen = () => {
    const stateToPass: TimerState = {
      currentTime,
      currentPhase,
      currentCycle,
      currentSet,
      isRunning,
      isFinished,
      totalElapsedSeconds,
    };
    navigate('/fullscreen-timer', { state: stateToPass });
  };

  const applySettings = () => {
    setShowSettings(false);
    resetTimer();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 my-font">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl my-bold text-[#f56262]/50 uppercase mb-2">Pomodoro Timer</h1>
          <p className="text-[#f56262]/30 uppercase">Помодоро Таймер</p>
        </div>

        <TimerDisplay
          currentTime={currentTime}
          isFinished={isFinished}
          onDoubleClick={handleGoFullscreen}
        />

        <div className="text-center mb-8">
            <div className="text-xl text-[#f56262]/50 mb-2">
                {phaseNames[currentPhase]}
            </div>
            <div className="text-sm text-[#f56262]/35">
                Цикл {currentCycle}/{settings.workCycles} • Сет {currentSet}/
                {settings.totalSets}
            </div>
        </div>

        <ProgressBar progress={getTotalProgress()} />

        <TimerControls
          isRunning={isRunning}
          volume={settings.volume}
          isVolumeSliderVisible={isVolumeSliderVisible}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          onVolumeChange={handleVolumeChange}
          toggleVolumeSlider={toggleVolumeSlider}
          onGoFullscreen={handleGoFullscreen}
          onShowSettings={() => setShowSettings(true)}
        />

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

export default TimerPage;

