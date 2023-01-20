import React from 'react';

const WalletConnectedGraphic: React.FC<React.SVGAttributes<SVGElement>> = ({ width = '152', height = '125' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 152 125" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.1842 8C1.1842 3.85787 4.54207 0.5 8.6842 0.5H144C148.142 0.5 151.5 3.85786 151.5 8V124.5H1.1842V8Z"
        stroke="white"
        strokeOpacity="0.25"
      />
      <rect x="98.0526" y="9.21053" width="46.0526" height="18.4211" rx="4" fill="white" fillOpacity="0.5" />
      <rect x="8.57893" y="43.4211" width="135.526" height="34.2105" rx="4" fill="black" fillOpacity="0.25" />
      <rect x="8.57893" y="82.8947" width="135.526" height="34.2105" rx="4" fill="black" fillOpacity="0.25" />
      <rect x="16.4737" y="51.3158" width="46.0526" height="18.4211" rx="4" fill="white" fillOpacity="0.1" />
      <rect x="16.4737" y="90.7895" width="46.0526" height="18.4211" rx="4" fill="white" fillOpacity="0.1" />
    </svg>
  );
};

export default WalletConnectedGraphic;
