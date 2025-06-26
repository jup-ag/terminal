import React, { useCallback } from 'react';
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import useTimeDiff from '../useTimeDiff/useTimeDiff';
import PriceInfo from '../PriceInfo/index';
import JupButton from '../JupButton';
import { cn } from 'src/misc/cn';

const ConfirmationScreen = () => {
  const {
    fromTokenInfo,
    toTokenInfo,
    onSubmit: onSubmitJupiter,
    quoteResponseMeta,
    loading,
    refresh,
  } = useSwapContext();

  const [hasExpired] = useTimeDiff();

  const { setScreen } = useScreenState();

  const onGoBack = () => {
    refresh();
    setScreen('Initial');
  };
  const onSubmit = useCallback(async () => {
    setScreen('Swapping');
    onSubmitJupiter();
  }, [onSubmitJupiter, setScreen]);

  return (
    <div className="flex flex-col h-full w-full py-4 px-2">
      <div className="flex w-full justify-between">
        <div className="text-white fill-current w-6 h-6 cursor-pointer" onClick={onGoBack}>
          <LeftArrowIcon width={24} height={24} />
        </div>

        <div className="text-white">Review Order</div>

        <div className=" w-6 h-6" />
      </div>

      <div>
        {quoteResponseMeta && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            quoteResponse={quoteResponseMeta}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            loading={loading}
            showFullDetails
            containerClassName="bg-v3-input-background border-none"
          />
        ) : null}
      </div>

      {hasExpired ? (
        <JupButton size="lg" className="w-full mt-4 disabled:opacity-50 !p-0" onClick={onGoBack}>
          <span className="text-sm">Refresh</span>
        </JupButton>
      ) : (
        <JupButton
          size="lg"
          className={cn(
            'w-full mt-4 disabled:opacity-50 !text-uiv2-text/75 leading-none !max-h-14 bg-gradient-to-r from-[#00BEF0] to-[#C7F284]',
          )}
          onClick={onSubmit}
        >
          <span>Confirm</span>
        </JupButton>
      )}
    </div>
  );
};

export default ConfirmationScreen;
