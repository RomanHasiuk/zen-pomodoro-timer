interface TimerDisplayProps {
  currentTime: number;
  isFinished: boolean;
  onDoubleClick: () => void;
  className?: string;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const TimerDisplay = ({ currentTime, isFinished, onDoubleClick, className }: TimerDisplayProps) => {
  return (
    <div className="text-center mb-4">
      <div
        className={`my-bold text-8xl text-[#f9ac68]/50 uppercase cursor-pointer mb-4 ${className}`}
        onDoubleClick={onDoubleClick}
      >
        {isFinished ? "Фініш!" : formatTime(currentTime)}
      </div>
    </div>
  );
};

export default TimerDisplay;
