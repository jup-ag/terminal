import React, { useEffect, useState } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';
import { ROUTE_CACHE_DURATION } from 'src/misc/constants';

const useTimeDiff = (): [boolean, number] => {
  const { lastRefreshTimestamp } = useSwapContext();

  const [hasExpired, setHasExpired] = React.useState(false);
  const [timeDiff, setTimeDiff] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!lastRefreshTimestamp) {
        return;
      }
      
      const value = Date.now() > lastRefreshTimestamp + ROUTE_CACHE_DURATION;

      const elapsedSeconds = (Date.now() - (lastRefreshTimestamp + ROUTE_CACHE_DURATION)) / 1_000;
      setTimeDiff((elapsedSeconds / (ROUTE_CACHE_DURATION / 1_000)) * 100);
      setHasExpired(value);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastRefreshTimestamp]);

  return [hasExpired, timeDiff];
};

export default useTimeDiff;
