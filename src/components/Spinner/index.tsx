import * as React from 'react';

const Spinner = ({
  className,
  baseColor = 'currentColor',
  spinnerColor = 'currentColor',
  width = 16,
  height = 16,
}: {
  className?: string;
  baseColor?: string;
  spinnerColor?: string;
  width?: number;
  height?: number;
}) => (
  <div className={`rounded-full flex items-center justify-center ${className}`} style={{ width, height }}>
    <svg
      className="animate-spin h-5 w-5 text-black dark:text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={baseColor} strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill={spinnerColor}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

export default Spinner;
