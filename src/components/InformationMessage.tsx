import React, { ReactNode } from 'react';
import InfoIconSVG from 'src/icons/InfoIconSVG';

const InformationMessage: React.FC<{
  darkMode?: boolean;
  message: ReactNode;
  iconSize?: number;
  className?: string;
}> = ({ darkMode = false, message, iconSize = 20, className }) => {
  return (
    <div
      className={`md:px-6 mt-1 flex items-center text-xs fill-current font-semibold ${
        darkMode ? 'text-white' : 'text-black/50'
      } ${className}`}
    >
      <InfoIconSVG width={iconSize} height={iconSize} />
      <span className="ml-2">{message}</span>
    </div>
  );
};

export default InformationMessage;
