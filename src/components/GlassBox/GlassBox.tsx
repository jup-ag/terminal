import React, { CSSProperties } from 'react';

const GlassBox = ({
  className,
  style,
  children,
  onClick,
}: {
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  onClick?(): void;
}) => {
  return (
    <div
      style={style}
      className={`w-full rounded-xl bg-white-75 dark:bg-white dark:bg-opacity-5 shadow-lg flex ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassBox;
