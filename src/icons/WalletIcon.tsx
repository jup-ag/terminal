import React from 'react';

const WalletIcon: React.FC<React.SVGAttributes<SVGElement>> = ({ width = 20, height = 20 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.0625 11H10.3125V2.75H8.59375V0H2.0625C0.923158 0 0 0.923158 0 2.0625V8.9375C0 10.0768 0.923158 11 2.0625 11ZM8.9375 4.125V9.625H2.0625C1.6825 9.625 1.375 9.3175 1.375 8.9375V4.00486C1.59589 4.08408 1.82818 4.12437 2.0625 4.12504L8.9375 4.125ZM2.0625 1.375H7.21875V2.75H2.0625C1.6825 2.75 1.375 2.4425 1.375 2.0625C1.375 1.6825 1.6825 1.375 2.0625 1.375Z"
        fill="white"
        fillOpacity="0.25"
      />
    </svg>
  );
};

export default WalletIcon;
