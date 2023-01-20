import React, { ReactNode } from 'react';

interface IJupInputContainer {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
  className?: string;
  // JupButton border gradient, globals.css
  highlighted?: boolean;
  disabled?: boolean;
}

const JupInputContainer = ({ onClick, highlighted, className, disabled, children }: IJupInputContainer) => {
  const background = highlighted
    ? 'linear-gradient(96.8deg, rgba(252, 192, 10, 0.05) 4.71%, rgba(78, 186, 233, 0.05) 87.84%)'
    : 'rgba(0,0,0,0.25)';
  return (
    <div
      onClick={onClick}
      className={`${highlighted ? 'jup-gradient' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } relative cursor-text rounded-xl text-white border-none border-jupiter-input-light ${className}`}
      style={{ background }}
    >
      {children}
    </div>
  );
};

export default JupInputContainer;
