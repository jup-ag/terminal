import React, { useEffect, useMemo, useState } from 'react';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import JupButton from '../JupButton';
import Spinner from '../Spinner';
import SuccessIcon from 'src/icons/SuccessIcon';
import PriceInfo from '../PriceInfo/index';
import { fromLamports } from 'src/misc/utils';
import { usePreferredExplorer } from 'src/contexts/preferredExplorer';
import V2SexyChameleonText from '../SexyChameleonText/V2SexyChameleonText';
import JupiterLogo from 'src/icons/JupiterLogo';

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
    lastSwapResult,
    reset,
    swapping: { txStatus },
    fromTokenInfo,
    toTokenInfo,
    refresh,
  } = useSwapContext();
  const { screen, setScreen } = useScreenState();

  const [errorMessage, setErrorMessage] = useState('');

  const onSwapMore = () => {
    reset();
    setErrorMessage('');
    setScreen('Initial');
    refresh();
  };

  const onGoBack = () => {
    reset({ resetValues: false });
    setErrorMessage('');
    setScreen('Initial');
    refresh();
  };

  useEffect(() => {
    if (screen !== 'Swapping') return;

    if (lastSwapResult?.swapResult && 'error' in lastSwapResult?.swapResult) {
      setErrorMessage(lastSwapResult?.swapResult?.error?.message || '');

      if (window.Jupiter.onSwapError) {
        window.Jupiter.onSwapError({
          error: lastSwapResult?.swapResult?.error,
          quoteResponseMeta: lastSwapResult?.quoteReponse,
        });
      }
      return;
    } else if (lastSwapResult?.swapResult && 'txid' in lastSwapResult?.swapResult) {
      if (window.Jupiter.onSuccess) {
        window.Jupiter.onSuccess({
          txid: lastSwapResult?.swapResult?.txid,
          swapResult: lastSwapResult?.swapResult,
          quoteResponseMeta: lastSwapResult?.quoteReponse,
        });
      }
      return;
    }
  }, [lastSwapResult, screen]);

  const onClose = () => {
    if (!displayMode || displayMode === 'modal') {
      window.Jupiter.close();
    }

    reset();
    setScreen('Initial');
  };

  const { explorer, getExplorer } = usePreferredExplorer();

  const isLoading =
    txStatus?.status === 'loading' || txStatus?.status === 'pending-approval' || txStatus?.status === 'sending';
  const Content = () => {
    return (
      <>
        <div className="flex w-full justify-center">
          <div className="text-white">{'Swapping'}</div>
        </div>

        <div className="flex w-full justify-center items-center mt-9">
          <div className="h-16 w-16 animate-hue duration-100">
            <JupiterLogo width={64} height={64} />
          </div>
        </div>

        <div className="flex flex-col w-full justify-center items-center px-5 mt-7">
          {isLoading && (
            <div className="flex items-center w-full rounded-xl p-4 bg-v3-input-background mb-2">
              <Spinner spinnerColor={'white'} />

              <div className="ml-4 flex w-full justify-between">
                <span className="text-white text-sm">
                  {txStatus.status === 'loading' && 'Preparing transactions'}
                  {txStatus.status === 'pending-approval' && 'Pending Approval'}
                  {txStatus.status === 'sending' && 'Swapping'}
                </span>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const SuccessContent = () => {
    const { inputAmount, outputAmount, explorerLink } = useMemo(() => {
      return {
        inputAmount:
          lastSwapResult?.swapResult && 'inputAmount' in lastSwapResult?.swapResult
            ? lastSwapResult?.swapResult.inputAmount
            : 0,
        outputAmount:
          lastSwapResult?.swapResult && 'outputAmount' in lastSwapResult?.swapResult
            ? lastSwapResult?.swapResult.outputAmount
            : 0,
        explorerLink:
          lastSwapResult?.swapResult && 'txid' in lastSwapResult?.swapResult
            ? getExplorer(lastSwapResult?.swapResult.txid)
            : '',
      };
    }, []);

    if (!fromTokenInfo || !toTokenInfo || !lastSwapResult?.quoteReponse) {
      return null;
    }

    return (
      <>
        <div className="flex justify-center mt-12">
          <div className="absolute top-[52px] bg-[#23C1AA] bg-opacity-[15%] rounded-full w-20 h-20 flex justify-center items-center animate-pulse" />

          <div className="h-[56px] w-[56px] bg-white rounded-full">
            <SuccessIcon />
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <p className="mt-5 text-white text-xl font-semibold">Swap successful</p>

          <div className="mt-4 bg-v3-input-background rounded-xl overflow-y-auto w-full webkit-scrollbar py-4 max-h-[260px]">
            <div className="mt-2 flex flex-col items-center justify-center text-center px-4">
              <p className="text-xs font-semibold text-white/75">
                Swapped {fromLamports(inputAmount, fromTokenInfo.decimals).toFixed(fromTokenInfo.decimals)} {fromTokenInfo.symbol} to
              </p>
              <p className="text-2xl font-semibold text-white/75">
                {fromLamports(outputAmount, toTokenInfo.decimals).toFixed(toTokenInfo.decimals)} {toTokenInfo.symbol}
              </p>
            </div>

            <PriceInfo
              quoteResponse={lastSwapResult?.quoteReponse}
              fromTokenInfo={fromTokenInfo}
              toTokenInfo={toTokenInfo}
              loading={false}
              showFullDetails
              containerClassName="bg-v3-input-background border-none mt-0"
            />
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
          <JupButton
            size="lg"
            className="w-full mt-4 disabled:opacity-50 !text-uiv2-text/75 leading-none !max-h-14 bg-v2-primary"
            onClick={onSwapMore}
          >
            <span>
              <span className="text-sm">Swap More</span>
            </span>
          </JupButton>

          {displayMode !== 'integrated' ? (
            <JupButton size="lg" className="w-full mt-4 disabled:opacity-50 leading-none !max-h-14 !text-white/75 bg-v2-background-dark" onClick={onClose}>
              <span className="text-sm">Close</span>
            </JupButton>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full w-full py-4 px-2">
      {errorMessage || txStatus?.status === 'fail' ? (
        <div className="">
          <div className="flex flex-col items-center justify-center text-center mt-12">
            <ErrorIcon />

            <p className="text-white mt-2">Swap Failed</p>
            <p className="text-white/50 text-xs mt-2">We were unable to complete the swap, please try again.</p>
            {errorMessage ? <p className="text-white/50 text-xs mt-2 break-all">{errorMessage}</p> : ''}

            <JupButton
              size="lg"
              className="w-full mt-6 disabled:opacity-50 !text-uiv2-text/75 leading-none !max-h-14 bg-v2-primary"
              onClick={onGoBack}
            >
              <span>Retry</span>
            </JupButton>
          </div>
        </div>
      ) : null}

      {!errorMessage && txStatus?.status === 'timeout' ? (
        <div className="flex justify-center">
          <div className="flex flex-col items-center justify-center text-center mt-12">
            <ErrorIcon />

            <p className="text-white mt-2">Transaction timed-out</p>
            <p className="text-white/50 text-xs mt-2">We were unable to complete the swap, please try again.</p>
            {errorMessage ? <p className="text-white/50 text-xs mt-2">{errorMessage}</p> : ''}

            <JupButton
              size="lg"
              className="w-full mt-6 disabled:opacity-50 !text-uiv2-text/75 leading-none !max-h-14 bg-v2-primary"
              onClick={onGoBack}
            >
              <span>Retry</span>
            </JupButton>
          </div>
        </div>
      ) : null}
      {!errorMessage && isLoading ? <Content /> : null}
      {!errorMessage && txStatus?.status === 'success' ? <SuccessContent /> : null}
    </div>
  );
};

export default SwappingScreen;
