import React from 'react';

const IconSwitchPairDark = ({ darkMode }: { darkMode?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.04393 5.74021L12 3.3701L9.04393 1V2.68839H1.0228V4.05189H9.04393V5.74021ZM2.95607 5.34607L0 7.71617L2.95607 10.0863V8.39789H10.9772V7.03439H2.95607V5.34607Z"
      fill={darkMode ? 'white' : 'black'}
      fillOpacity="0.5"
    />
  </svg>
);

const SwitchPairButton = ({
  className,
  darkMode,
  onClick,
  disabled,
}: {
  darkMode?: boolean;
  className?: string;
  onClick(): void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex justify-center">
      <div
        onClick={onClick}
        className={`border bg-black/10 fill-current h-8 w-8 rounded-full flex items-center justify-center cursor-pointer ${
          darkMode
            ? 'border-[#424242] text-white-35 hover:text-white/50 hover:border-white/50'
            : 'border-[#e0e0e0] text-black'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <div className="block -rotate-45">
          <IconSwitchPairDark darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default SwitchPairButton;
