import React from 'react';

const TerminalWidgetIcon: React.FC<React.SVGAttributes<SVGElement>> = ({ width = '20', height = '20' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 15.6L5 15.6M6.3 1H14.7C16.3802 1 17.2202 1 17.862 1.32698C18.4265 1.6146 18.8854 2.07354 19.173 2.63803C19.5 3.27976 19.5 4.11984 19.5 5.8V14.2C19.5 15.8802 19.5 16.7202 19.173 17.362C18.8854 17.9265 18.4265 18.3854 17.862 18.673C17.2202 19 16.3802 19 14.7 19H6.3C4.61984 19 3.77976 19 3.13803 18.673C2.57354 18.3854 2.1146 17.9265 1.82698 17.362C1.5 16.7202 1.5 15.8802 1.5 14.2V5.8C1.5 4.11984 1.5 3.27976 1.82698 2.63803C2.1146 2.07354 2.57354 1.6146 3.13803 1.32698C3.77976 1 4.61984 1 6.3 1Z"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TerminalWidgetIcon;
