import { type ReactNode } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button = ({ onClick, children, className = '', disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`bg-white/3 hover:bg-white/7 text-[#f56262]/50 p-4 rounded-md transition-colors shadow-lg disabled:opacity-30  disabled:text-black disabled:hover:bg-white/3 ${className}`}
      disabled={disabled} 
    >
      {children}
    </button>
  );
};

export default Button;
