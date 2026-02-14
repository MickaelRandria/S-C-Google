import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`
      bg-white/25 
      backdrop-blur-xl 
      border border-rose-200/30 
      rounded-3xl 
      shadow-[0_8px_30px_rgb(232,93,117,0.08)] 
      ${noPadding ? '' : 'p-6'} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;