import { Play, Pause, RotateCcw, Volume1, Volume2, VolumeX, Maximize, Minimize, Settings } from "lucide-react";
import Button from "./Button";
import VolumeSlider from "./VolumeSlider";

interface TimerControlsProps {
  isRunning: boolean;
  volume: number;
  isVolumeSliderVisible: boolean;
  isLocked?: boolean;
  isFullscreen?: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  onVolumeChange: (newVolume: number) => void;
  toggleVolumeSlider: () => void;
  onGoFullscreen: () => void;
  onShowSettings: () => void;
}

const TimerControls = ({
  isRunning,
  volume,
  isVolumeSliderVisible,
  isLocked = false,
  isFullscreen = false,
  toggleTimer,
  resetTimer,
  onVolumeChange,
  toggleVolumeSlider,
  onGoFullscreen,
  onShowSettings,
}: TimerControlsProps) => {

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={24} />;
    if (volume <= 50) return <Volume1 size={24} />;
    return <Volume2 size={24} />;
  };

  return (
    <div className="flex justify-center items-start gap-4 mb-8">
      <Button onClick={toggleTimer} disabled={isLocked}>
        {isRunning ? <Pause size={24} /> : <Play size={24} />}
      </Button>

      <Button onClick={resetTimer} disabled={isLocked}>
        <RotateCcw size={24} />
      </Button>

      <div className="relative">
        <Button
          onClick={toggleVolumeSlider}
          className={volume === 0 ? "bg-black/25" : ""}
          disabled={isLocked}
        >
          {getVolumeIcon()}
        </Button>
        {isVolumeSliderVisible && (
          <VolumeSlider volume={volume} onVolumeChange={onVolumeChange} />
        )}
      </div>

      <Button onClick={onGoFullscreen} disabled={isLocked}>
        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </Button>

      <Button onClick={onShowSettings} disabled={isLocked}>
        <Settings size={24} />
      </Button>
    </div>
  );
};

export default TimerControls;


