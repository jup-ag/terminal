import React from 'react';

const RightArrowIcon: React.FC<{ className?: string; width?: number; height?: number }> = ({
  className = '',
  width = 8,
  height = 7,
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 8 7"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.647 3.674H.69c-.91 0-.91-1.38 0-1.38h4.957L3.89.537c-.659-.659.314-1.631.973-.972l2.949 2.949c.25.25.25.69 0 .972l-2.95 2.95c-.658.627-1.63-.346-.972-.973l1.757-1.788z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

export default RightArrowIcon;
