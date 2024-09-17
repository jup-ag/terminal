import { useState } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';

export const useMobile = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useIsomorphicLayoutEffect(() => {
    function updateSize() {
      const desktopQuery = window.matchMedia('(min-width: 1024px)');
      setIsDesktop(desktopQuery.matches);
    }

    // Initial check
    updateSize();

    // Listen to resize events
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initially, the state will be false (indicating non-desktop)
  // until the effect runs on the client side.
  return !isDesktop;
};
