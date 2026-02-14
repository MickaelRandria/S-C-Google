import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, (current / total) * 100);

  return (
    <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm border border-rose-100/30">
      <div 
        className="h-full bg-gradient-to-r from-[#E85D75] to-[#FF8FA3] transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(232,93,117,0.4)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;