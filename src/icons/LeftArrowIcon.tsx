import * as React from 'react';

const LeftArrowIcon: React.FC<React.SVGAttributes<SVGElement>> = ({ width = '12', height = '12' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 53 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.3336 23.8334H43.7062V28.1667H17.3336L28.9555 39.7887L25.8919 42.8524L9.03955 26L25.8919 9.14771L28.9555 12.2114L17.3336 23.8334Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default LeftArrowIcon;
