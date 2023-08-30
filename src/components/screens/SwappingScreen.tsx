import React, { useEffect, useMemo, useState } from 'react';
import Rive, { Alignment, Fit, Layout } from '@rive-app/react-canvas';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import JupButton from '../JupButton';
import SexyChameleonText from '../SexyChameleonText/SexyChameleonText';
import Spinner from '../Spinner';
import SuccessIcon from 'src/icons/SuccessIcon';
import { usePreferredExplorer } from 'src/contexts/preferredExplorer';
import TokenIcon from '../TokenIcon';

const ErrorIcon = () => {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_7547_116874)">
        <circle cx="20" cy="20" r="20" fill="#F04A44" />
        <path
          d="M19.8444 25.4321C18.6773 25.4332 17.7205 24.5092 17.6793 23.3431L17.1718 9.04107C17.1507 8.45326 17.3706 7.88344 17.7786 7.46056C18.1867 7.03768 18.7492 6.7998 19.337 6.7998H20.3519C20.9397 6.7998 21.5021 7.03768 21.9102 7.46056C22.3183 7.88344 22.5382 8.45329 22.5171 9.04107L22.0096 23.3431C21.9684 24.5092 21.0116 25.4332 19.8444 25.4321Z"
          fill="white"
        />
        <path
          d="M22.8893 30.4989C22.8893 32.1809 21.5266 33.5436 19.8446 33.5436C18.1626 33.5436 16.7998 32.1809 16.7998 30.4989C16.7998 28.8169 18.1626 27.4541 19.8446 27.4541C21.5266 27.4541 22.8893 28.8169 22.8893 30.4989Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_7547_116874">
          <rect width="40" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

const SwappingScreen = () => {
  const {
    displayMode,
    reset,
    scriptDomain,
    swapping: { totalTxs, txStatus },
    fromTokenInfo,
    toTokenInfo,
    form,
  } = useSwapContext();
  const { screen, setScreen } = useScreenState();

  const [errorMessage, setErrorMessage] = useState('');

  const onSwapMore = () => {
    reset();
    setErrorMessage('');
    setScreen('Initial');
  };

  const onGoBack = () => {
    reset({ resetValues: false });
    setErrorMessage('');
    setScreen('Initial');
  };

  useEffect(() => {
    if (screen !== 'Swapping') return;

    if (txStatus?.status === 'fail') {
      setErrorMessage(txStatus.txDescription);
    }
  }, [txStatus]);

  const onClose = () => {
    if (!displayMode || displayMode === 'modal') {
      window.Jupiter.close();
    }

    reset();
    setScreen('Initial');
  };

  const swapState: 'success' | 'error' | 'loading' = useMemo(() => {
    const hasErrors = txStatus?.status === 'fail';
    if (hasErrors || errorMessage) {
      return 'error';
    }

    if (txStatus?.status === 'success') {
      return 'success';
    }

    return 'loading';
  }, [txStatus]);

  const { explorer, getExplorer } = usePreferredExplorer();

  const Content = () => {
    return (
      <>
        <div className="flex w-full justify-center">
          <div className="text-white">
            {swapState === 'loading' ? (
              <div className="flex justify-center space-x-1">
                <span>Locking for </span>
                <TokenIcon tokenInfo={toTokenInfo} />
                <span>{toTokenInfo?.symbol}</span>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>

        <div className="flex w-full justify-center items-center mt-9">
          <div className="h-16 w-16">
            <Rive
              src={`${scriptDomain}/swap-animation.riv`}
              layout={new Layout({ fit: Fit.Contain, alignment: Alignment.TopCenter })}
            />
          </div>
        </div>

        {totalTxs === 0 ? (
          <span className="text-white text-center mt-8 text-sm px-4">Awaiting approval from your wallet...</span>
        ) : null}
        {totalTxs > 1 ? (
          <span className="text-white text-center mt-8 text-sm px-4">
            Because of transaction size limits, we need to split up the transactions
          </span>
        ) : (
          ''
        )}

        <div className="flex flex-col w-full justify-center items-center px-5 mt-7">
          {txStatus ? (
            <div className="flex items-center w-full rounded-xl p-4 bg-[#25252D] mb-2">
              <Spinner spinnerColor={'white'} />

              <div className="ml-4 text-white text-sm">
                <span>Locking</span>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  };

  const SuccessContent = () => {
    if (!fromTokenInfo || !toTokenInfo) {
      return null;
    }

    const explorerLink = txStatus?.txid ? getExplorer(txStatus?.txid) : null;

    return (
      <>
        <div className="flex justify-center mt-12">
          <div className="absolute top-[52px] bg-[#23C1AA] bg-opacity-[15%] rounded-full w-20 h-20 flex justify-center items-center animate-pulse" />

          <div className="h-[56px] w-[56px] bg-white rounded-full">
            <SuccessIcon />
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <p className="mt-5 text-white text-xl font-semibold">Locked successfully</p>

          <div className="mt-4 bg-[#25252D] rounded-xl overflow-y-auto w-full webkit-scrollbar py-4 max-h-[260px]">
            <div className="mt-2 flex flex-col items-center justify-center text-center px-4">
              <p className="text-xs font-semibold text-white/75">
                Locked {form.fromValue} {' '}
                {fromTokenInfo.symbol} for {form.selectedPlan}
              </p>
              <p className="text-2xl font-semibold text-white/75">
                {toTokenInfo.symbol} plan
              </p>
            </div>
          </div>
        </div>

        {explorerLink ? (
          <a
            href={explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-white/50 mt-2 ml-2 text-xs hover:underline"
          >
            View on {explorer}
          </a>
        ) : null}

        <div className="mt-auto px-5 pb-4 flex space-x-2">
          <JupButton size="lg" className="w-full mt-4" type="button" onClick={onSwapMore}>
            <SexyChameleonText>
              <span className="text-sm">Swap More</span>
            </SexyChameleonText>
          </JupButton>

          {displayMode !== 'integrated' ? (
            <JupButton size="lg" className="w-full mt-4" type="button" onClick={onClose}>
              <span className="text-sm">Close</span>
            </JupButton>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full w-full py-4 px-2">
      {errorMessage || swapState === 'error' ? (
        <div className="flex justify-center">
          <div className="flex flex-col items-center justify-center text-center mt-12">
            <ErrorIcon />

            <p className="text-white mt-2">Failed to lock</p>
            <p className="text-white/50 text-xs mt-2">We were unable to complete the locking, please try again.</p>
            {errorMessage ? <p className="text-white/50 text-xs mt-2">{errorMessage}</p> : ''}

            <JupButton size="lg" className="w-full mt-6 disabled:opacity-50" type="button" onClick={onGoBack}>
              <SexyChameleonText>Retry</SexyChameleonText>
            </JupButton>
          </div>
        </div>
      ) : null}

      {!errorMessage && swapState === 'loading' ? <Content /> : null}
      {!errorMessage && swapState === 'success' ? <SuccessContent /> : null}
    </div>
  );
};

export default SwappingScreen;
