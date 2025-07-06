interface ProgressBarProps {
  progress: number;
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <div className="mb-8">
      <div className="w-full bg-black rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-[#C13101]/30 to-[#C13101]/60 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-xs text-[#f56262]/25 text-center">
        Загальний прогрес: {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ProgressBar;
