import React from 'react';

const WalletDisconnectedGraphic: React.FC<React.SVGAttributes<SVGElement>> = ({ width = '152', height = '125' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 152 125" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.868408 8C0.868408 3.85787 4.22627 0.5 8.36841 0.5H143.684C147.826 0.5 151.184 3.85786 151.184 8V124.5H0.868408V8Z"
        stroke="white"
        strokeOpacity="0.25"
      />
      <rect
        x="98.2368"
        y="9.71053"
        width="45.0526"
        height="17.4211"
        rx="3.5"
        stroke="white"
        strokeOpacity="0.25"
        strokeDasharray="2 2"
      />
      <rect x="8.26315" y="43.4211" width="135.526" height="34.2105" rx="4" fill="black" fillOpacity="0.25" />
      <rect x="8.26315" y="82.8947" width="135.526" height="34.2105" rx="4" fill="black" fillOpacity="0.25" />
      <rect x="16.1579" y="51.3158" width="46.0526" height="18.4211" rx="4" fill="white" fillOpacity="0.1" />
      <rect x="16.1579" y="90.7895" width="46.0526" height="18.4211" rx="4" fill="white" fillOpacity="0.1" />
    </svg>
  );
};

export default WalletDisconnectedGraphic;
