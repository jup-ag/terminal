import * as React from 'react';

interface ICheckIconProps {
  width?: number;
  height?: number;
}

const CheckIcon: React.FunctionComponent<ICheckIconProps> = ({ width = 10, height = 10 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 10 10" fill="transparent" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.33329 2.5L3.74996 7.08333L1.66663 5"
        stroke="#768222"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckIcon;
