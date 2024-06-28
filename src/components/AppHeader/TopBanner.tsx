import { useLocalStorage } from '@jup-ag/wallet-adapter';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import CloseIcon from 'src/icons/CloseIcon';
import { FEATURE_SHOWCASE_BUTTON_ID } from '../FeatureShowcaseButton';

let shouldHide = false; // indicate that user close it once for the session, we dont need to show it again.

const TopBanner = () => {
  const [closeCount, setCloseCount] = useLocalStorage(`banner-close-count`, 0);
  const [close, setClose] = useState(true);
  useEffect(() => {
    if (shouldHide) {
      return;
    }
    if (closeCount && closeCount >= 1) {
      setClose(true);
    } else {
      setClose(false);
    }
  }, [closeCount]);

  const handleClose = () => {
    shouldHide = true;
    setClose(true);
    setCloseCount((prev) => (prev ? prev + 1 : 1));
  };

  const openFeatureShowcase = useCallback(() => {
    if (typeof window === 'undefined') return;
    document.getElementById(FEATURE_SHOWCASE_BUTTON_ID)?.click();
  }, [])


  return (
    <>
      {!close && (
        <div
          className={classNames(
            'text-center py-2 text-xs text-[#333333] bg-warning font-semibold relative animate-fade-in transition-all flex flex-col md:flex-row justify-center gap-2',
            typeof closeCount !== 'undefined' ? `h-16 md:h-[34px]` : 'h-[0]',
          )}
        >
          <span>{`V3 offers full tokens selection, better routing, and more. V2 will be deprecated soon.`}</span>
          <button onClick={openFeatureShowcase} type="button" className="flex justify-center space-x-1 underline">
            {`Check out what's new in v3`}
          </button>

          <div className="cursor-pointer absolute right-4 top-2.5" onClick={handleClose}>
            <CloseIcon width={12} height={12} />
          </div>
        </div>
      )}
    </>
  );
};

export default TopBanner;
