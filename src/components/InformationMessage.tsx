import React, { ReactNode } from 'react';
import InfoIconSVG from 'src/icons/InfoIconSVG';

const InformationMessage: React.FC<{ message: ReactNode; iconSize?: number; className?: string }> = ({
  message,
  iconSize = 20,
  className,
}) => {
  return (
    <div
      className={`md:px-6 mt-1 flex items-center text-xs fill-current text-black/50 dark:text-primary-text font-semibold ${className}`}
    >
      <InfoIconSVG width={iconSize} height={iconSize} />
      <span className="ml-2">{message}</span>
    </div>
  );
};

export default InformationMessage;
