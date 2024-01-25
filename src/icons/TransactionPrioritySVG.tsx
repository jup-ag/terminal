import React, { SVGProps } from 'react';

const TransactionPrioritySVG: React.FC<SVGProps<SVGSVGElement>> = ({
  width = 12,
  height = 12,
}: {
  width?: string | number;
  height?: string | number;
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 12 12" fill="inherit" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_10835_148498)">
        <path
          d="M1.5 6C1.5 4.34595 2.84591 3 4.5 3V4.5L7.5 2.25L4.5 0V1.5C2.01855 1.5 0 3.51855 0 6C0 8.48145 2.01855 10.5 4.5 10.5H6.75V9H4.5C2.84595 9 1.5 7.6541 1.5 6Z"
          fill="inherit"
        />
        <path d="M8.25 1.5H12V3H8.25V1.5Z" fill="inherit" />
        <path d="M8.25 5.25H12V6.75H8.25V5.25Z" fill="inherit" />
        <path d="M8.25 9H12V10.5H8.25V9Z" fill="inherit" />
      </g>
      <defs>
        <clipPath id="clip0_10835_148498">
          <rect width="12" height="12" fill="inherit" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TransactionPrioritySVG;
