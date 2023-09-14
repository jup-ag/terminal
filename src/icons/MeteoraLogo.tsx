import React from 'react';

const MeteoraLogo: React.FC<{ width?: number; height?: number }> = ({ width = 24, height = 24 }) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={'https://app.meteora.ag/icons/logo.svg'} width={width} height={height} alt="Meteora" />;
};

export default MeteoraLogo;
