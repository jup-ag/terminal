import { useLocalStorage } from '@jup-ag/wallet-adapter';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import CloseIcon from 'src/icons/CloseIcon';
import { V2_FEATURE_BUTTON_ID } from '../V2FeatureButton';

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

  const openV2Feature = useCallback(() => {
    if (typeof window === 'undefined') return;
    document.getElementById(V2_FEATURE_BUTTON_ID)?.click();
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
          <span>{`Terminal v1 is deprecated, please migrate to v2.`}</span>
          <button onClick={openV2Feature} type="button" className="flex justify-center space-x-1 underline">
            {`Check out what's new in v2`}
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
