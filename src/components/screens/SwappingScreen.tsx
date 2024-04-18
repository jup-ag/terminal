import React, { useEffect, useMemo, useState } from 'react';

import { useUSDValueProvider } from 'src/contexts/USDValueProvider';
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
    form,
    displayMode,
    lastSwapResult,
    reset,
    scriptDomain,
    swapping: { txStatus },
    formProps: { darkMode, gmPointCoefficient },
    fromTokenInfo,
    toTokenInfo,
    jupiter: { refresh },
  } = useSwapContext();
  const { screen, setScreen } = useScreenState();

  const [errorMessage, setErrorMessage] = useState('');

  const { tokenPriceMap } = useUSDValueProvider();

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
          quoteResponseMeta: lastSwapResult?.quoteResponseMeta,
        });
      }
      return;
    } else if (lastSwapResult?.swapResult && 'txid' in lastSwapResult?.swapResult) {
      if (window.Jupiter.onSuccess) {
        window.Jupiter.onSuccess({
          txid: lastSwapResult?.swapResult?.txid,
          swapResult: lastSwapResult?.swapResult,
          quoteResponseMeta: lastSwapResult?.quoteResponseMeta,
          result: {
            from_token_ca: fromTokenInfo?.address,
            from_token_amount: lastSwapResult.swapResult.inputAmount / 10 ** (fromTokenInfo?.decimals || 0),
            from_token_chain: fromTokenInfo?.chainId,
            point:
              Number(tokenPriceMap[fromTokenInfo?.address || '']?.usd || 0) *
              Number(form.fromValue) *
              Number(gmPointCoefficient),
            to_token_ca: toTokenInfo?.address,
            to_token_amount: lastSwapResult.swapResult.outputAmount / 10 ** (toTokenInfo?.decimals || 0),
            to_token_chain: toTokenInfo?.chainId,
          },
        });
      }
      return;
    }
  }, [lastSwapResult]);

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

    const allSuccess = txStatus?.status === 'success';
    if (allSuccess) {
      return 'success';
    }

    return 'loading';
  }, [txStatus]);

  const currentTime = useMemo(() => Date.now(), []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (swapState === 'success' || swapState === 'error') return;

      // If over 30s, timeout
      if (Date.now() - currentTime > 30e3) {
        setErrorMessage('Transaction timed-out, please try again.');
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [swapState]);
  const { explorer, getExplorer } = usePreferredExplorer();

  const Content = () => {
    return (
      <>
        <div className="flex justify-center w-full">
          <div className={`${darkMode ? 'text-white' : 'text-black'}`}>
            {swapState === 'loading' ? 'Performing Swap' : ''}
          </div>
        </div>

        <div className="flex items-center justify-center w-full mt-9">
          <div className="w-16 h-16 duration-100 animate-hue">
            <JupiterLogo width={64} height={64} />
          </div>
        </div>

        {txStatus === undefined ? (
          <span className={`px-4 mt-8 text-sm text-center ${darkMode ? 'text-white' : 'text-black'}`}>
            Awaiting approval from your wallet...
          </span>
        ) : null}

        <div className="flex flex-col items-center justify-center w-full px-5 mt-7">
          {swapState === 'loading' && (
            <div
              className={`flex items-center w-full rounded-xl p-4 mb-2 ${darkMode ? 'bg-[#25252D]' : 'bg-gray-300'}`}
            >
              <Spinner spinnerColor={'white'} />

              <div className={`ml-4 text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
                <span>Swapping</span>
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
    }, [lastSwapResult?.swapResult]);

    if (!fromTokenInfo || !toTokenInfo || !lastSwapResult?.quoteResponseMeta) {
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

        <div className="flex flex-col items-center justify-center">
          <p className={`mt-5 text-xl font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Swap successful</p>

          <div
            className={`mt-4 rounded-xl overflow-y-auto w-full webkit-scrollbar py-4 max-h-[260px] ${
              darkMode ? 'bg-[#25252D]' : 'bg-gray-300'
            }`}
          >
            <div className="flex flex-col items-center justify-center px-4 mt-2 text-center">
              <p className={`text-xs font-semibold ${darkMode ? 'text-white/75' : 'text-black/75'}`}>
                Swapped {fromLamports(inputAmount, fromTokenInfo.decimals)} {fromTokenInfo.symbol} to
              </p>
              <p className={`text-2xl font-semibold ${darkMode ? 'text-white/75' : 'text-black/75'}`}>
                {fromLamports(outputAmount, toTokenInfo.decimals)} {toTokenInfo.symbol}
              </p>
            </div>

            <PriceInfo
              quoteResponse={lastSwapResult?.quoteResponseMeta.quoteResponse}
              fromTokenInfo={fromTokenInfo}
              toTokenInfo={toTokenInfo}
              loading={false}
              showFullDetails
              containerClassName={`border-none mt-0 ${darkMode ? 'bg-[#25252D]' : 'bg-gray-300'}`}
              darkMode={darkMode}
              gmPointCoefficient={gmPointCoefficient}
            />
          </div>
        </div>

        {explorerLink ? (
          <a
            href={explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 ml-2 text-xs cursor-pointer hover:underline ${
              darkMode ? 'text-white/50' : 'text-black/50'
            }`}
          >
            View on {explorer}
          </a>
        ) : null}

        <div className="flex px-5 pb-4 mt-auto space-x-2">
          <JupButton darkMode={darkMode} size="lg" className="w-full mt-4" type="button" onClick={onSwapMore}>
            <V2SexyChameleonText>
              <span className="text-sm">Swap More</span>
            </V2SexyChameleonText>
          </JupButton>

          {displayMode !== 'integrated' ? (
            <JupButton darkMode={darkMode} size="lg" className="w-full mt-4" type="button" onClick={onClose}>
              <span className="text-sm">Close</span>
            </JupButton>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col w-full h-full px-2 py-4">
      {errorMessage || swapState === 'error' ? (
        <div className="flex justify-center">
          <div className="flex flex-col items-center justify-center mt-12 text-center">
            <ErrorIcon />

            <p className={`mt-2 ${darkMode ? 'text-white' : 'text-black'}`}>Swap Failed</p>
            <p className={`mt-2 text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>
              We were unable to complete the swap, please try again.
            </p>
            {errorMessage ? (
              <p className={`mt-2 text-xs ${darkMode ? 'text-white/50' : 'text-black/50'}`}>{errorMessage}</p>
            ) : (
              ''
            )}

            <JupButton
              darkMode={darkMode}
              size="lg"
              className="w-full mt-6 disabled:opacity-50"
              type="button"
              onClick={onGoBack}
            >
              <V2SexyChameleonText>Retry</V2SexyChameleonText>
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
