import React from 'react';

const SpinnerProgress = ({
  percentage,
  strokeWidth = 2,
  sqSize = 14,
  strokeColor = '#23C1AA',
  strokeBgColor = '#FFFFFF'
}: {
  percentage: number;
  strokeWidth?: number;
  sqSize?: number;
  strokeColor?: string;
  strokeBgColor?: string;
}) => {
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <svg width={sqSize} height={sqSize} viewBox={viewBox}>
      <circle
        className={`fill-transparent`}
        stroke={strokeColor}
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
      />
      <circle
        className="fill-transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth + 0.4}px`} // + 0.4 lower bleeding
        // Start progress marker at 12 O'Clock
        transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
        stroke={strokeBgColor}
        style={{
          strokeDasharray: dashArray,
          strokeDashoffset: dashOffset,
        }}
      />
    </svg>
  );
};

export default SpinnerProgress;
