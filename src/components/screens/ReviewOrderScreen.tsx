import React from 'react';
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import useTimeDiff from '../useTimeDiff/useTimeDiff';
import PriceInfo from '../PriceInfo/index';
import JupButton from '../JupButton';
import V2SexyChameleonText from '../SexyChameleonText/V2SexyChameleonText';

const ConfirmationScreen = () => {
  const {
    fromTokenInfo,
    toTokenInfo,
    onSubmit: onSubmitJupiter,
    quoteResponseMeta,
    formProps: { darkMode },
    jupiter: { loading, refresh },
  } = useSwapContext();

  const [hasExpired] = useTimeDiff();

  const { setScreen } = useScreenState();

  const onGoBack = () => {
    refresh();
    setScreen('Initial');
  };
  const onSubmit = () => {
    setScreen('Swapping');
    onSubmitJupiter();
  };

  return (
    <div className="flex flex-col w-full h-full px-2 py-4">
      <div className="flex justify-between w-full">
        <div
          className={`w-6 h-6 cursor-pointer fill-current ${darkMode ? 'text-white' : 'text-black'}`}
          onClick={onGoBack}
        >
          <LeftArrowIcon width={24} height={24} />
        </div>

        <div className={`${darkMode ? 'text-white' : 'text-black'}`}>Review Order</div>

        <div className="w-6 h-6 " />
      </div>

      <div>
        {quoteResponseMeta && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            quoteResponse={quoteResponseMeta.quoteResponse}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            loading={loading}
            showFullDetails
            containerClassName={`border-none ${darkMode ? 'bg-[#25252D]' : 'bg-gray-300'}`}
            darkMode={darkMode}
          />
        ) : null}
      </div>

      {hasExpired ? (
        <JupButton
          darkMode={darkMode}
          size="lg"
          className="w-full mt-4 disabled:opacity-50 !p-0"
          type="button"
          onClick={onGoBack}
        >
          <span className="text-sm">Refresh</span>
        </JupButton>
      ) : (
        <JupButton
          darkMode={darkMode}
          size="lg"
          className="w-full mt-4 disabled:opacity-50"
          type="button"
          onClick={onSubmit}
        >
          <V2SexyChameleonText>Confirm</V2SexyChameleonText>
        </JupButton>
      )}
    </div>
  );
};

export default ConfirmationScreen;
