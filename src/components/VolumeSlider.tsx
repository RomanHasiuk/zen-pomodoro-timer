interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (newVolume: number) => void;
}

const VolumeSlider = ({ volume, onVolumeChange }: VolumeSliderProps) => {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 p-2 bg-black/30 backdrop-blur-md rounded-lg shadow-lg z-10">
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="w-24 h-1 transition-all duration-300 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, rgba(193, 49, 1, 0.3) 0%, rgba(193, 49, 1, 0.6) ${volume}%, black ${volume}%, black 100%)`,
        }}
      />
    </div>
  );
};

export default VolumeSlider;
