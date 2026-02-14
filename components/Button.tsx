import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'glass' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = "font-bold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm disabled:transform-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#E85D75] to-[#FF6B8A] text-white hover:shadow-lg hover:shadow-rose-500/25",
    secondary: "bg-white text-[#2D1B2E] hover:bg-rose-50 border border-rose-200 hover:border-rose-300",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/30",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/30",
    outline: "border-2 border-[#E85D75] text-[#E85D75] hover:bg-[#E85D75] hover:text-white",
    glass: "bg-white/30 backdrop-blur-md border border-rose-100/50 text-[#2D1B2E] hover:bg-white/50 hover:border-rose-200",
    ghost: "bg-transparent hover:bg-rose-50/50 text-[#6B4C6E] hover:text-[#E85D75] shadow-none"
  };

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3.5 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-6 text-xl"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;