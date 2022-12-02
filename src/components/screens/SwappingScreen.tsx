import React, { useEffect, useMemo, useState } from 'react'
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext'
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import JupiterLogo from 'src/icons/JupiterLogo';
import JupButton from '../JupButton';
import SexyChameleonText from '../SexyChameleonText/SexyChameleonText';
import Spinner from '../Spinner';
import TokenIcon from '../TokenIcon';

const SuccessIcon = () => {
  return (
    <div className='h-5 w-5 rounded-full bg-[#72E6ED] flex items-center justify-center p-1'>
      <svg width="12" height="7.5" viewBox="0 0 16 10" fill="black" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6746 0.292893C16.1081 0.683417 16.1081 1.31658 15.6746 1.70711L6.79418 9.70711C6.36068 10.0976 5.65783 10.0976 5.22433 9.70711L0.784112 5.70711C0.350609 5.31658 0.350609 4.68342 0.784112 4.29289C1.21761 3.90237 1.92046 3.90237 2.35396 4.29289L6.00925 7.58579L14.1048 0.292893C14.5383 -0.0976311 15.2411 -0.0976311 15.6746 0.292893Z" fill="black" />
      </svg>
    </div>
  )
}

const ErrorIcon = () => {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_7547_116874)">
        <circle cx="20" cy="20" r="20" fill="#F04A44" />
        <path d="M19.8444 25.4321C18.6773 25.4332 17.7205 24.5092 17.6793 23.3431L17.1718 9.04107C17.1507 8.45326 17.3706 7.88344 17.7786 7.46056C18.1867 7.03768 18.7492 6.7998 19.337 6.7998H20.3519C20.9397 6.7998 21.5021 7.03768 21.9102 7.46056C22.3183 7.88344 22.5382 8.45329 22.5171 9.04107L22.0096 23.3431C21.9684 24.5092 21.0116 25.4332 19.8444 25.4321Z" fill="white" />
        <path d="M22.8893 30.4989C22.8893 32.1809 21.5266 33.5436 19.8446 33.5436C18.1626 33.5436 16.7998 32.1809 16.7998 30.4989C16.7998 28.8169 18.1626 27.4541 19.8446 27.4541C21.5266 27.4541 22.8893 28.8169 22.8893 30.4989Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_7547_116874">
          <rect width="40" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>

  )
}

const SwappingScreen = () => {
  const {
    displayMode,
    lastSwapResult,
    reset,
    swapping: {
      txStatus,
    },
    jupiter: {
      refresh,
    }
  } = useSwapContext();
  const { setScreen } = useScreenState();

  const [errorMessage, setErrorMessage] = useState('');

  const onGoBack = () => {
    reset({ resetValues: false });
    setErrorMessage('');
    setScreen('Initial');
    refresh();
  }

  useEffect(() => {
    if (lastSwapResult && 'error' in lastSwapResult) {
      setErrorMessage(lastSwapResult.error?.message || '');

      if (window.Jupiter.onSwapError) {
        window.Jupiter.onSwapError({ error: lastSwapResult.error });
      }
      return;
    } else if (lastSwapResult && 'txid' in lastSwapResult) {
      if (window.Jupiter.onSuccess) {
        window.Jupiter.onSuccess({ txid: lastSwapResult.txid })
      }
      return;
    }
  }, [lastSwapResult])

  const onClose = () => {
    if (displayMode === 'modal') {
      window.Jupiter.close();
    }

    reset();
    setScreen('Initial');
  }

  const swapState: 'success' | 'error' | 'loading' = useMemo(() => {
    const hasErrors = txStatus.find(item => item.status === 'fail')
    if (hasErrors) {
      return 'error';
    }

    const allSuccess = txStatus.every(item => item.status !== 'loading')
    if (txStatus.length > 0 && allSuccess) {
      return 'success'
    }

    return 'loading'
  }, [txStatus]);

  const Content = () => {
    return (
      <>
        <div className='flex w-full justify-center'>
          <div className='text-white'>
            Performing Swap
          </div>
        </div>

        <div className='flex justify-center mt-9'>
          <JupiterLogo width={64} height={64} />
        </div>

        <div className='flex flex-col w-full justify-center items-center px-5 mt-7'>
          {txStatus && txStatus.map(item => (
            <div key={item.txid} className='flex items-center w-full rounded-xl p-4 bg-[#25252D] mb-2'>
              {item.status === 'loading' ? <Spinner spinnerColor={'white'} /> : <SuccessIcon />}

              <div className='ml-4 text-white text-sm'>
                {item.txDescription === 'SETUP' ? <span>Setup</span> : null}
                {item.txDescription === 'SWAP' ? <span>Swap</span> : null}
                {item.txDescription === 'CLEANUP' ? <span>Cleanup</span> : null}
              </div>
            </div>
          ))}
        </div>

        {swapState === 'success' ? (
          <div className='mt-auto px-5'>
            <JupButton
              size="lg"
              className="w-full mt-4 disabled:opacity-50"
              type="button"
              onClick={onClose}
            >
              <span className='text-sm'>Close</span>
            </JupButton>
          </div>
        ) : null}</>
    )
  };

  return (
    <div className='flex flex-col h-full w-full py-4 px-2'>
      {errorMessage || swapState === 'error'
        ? (
          <div className='flex justify-center'>
            <div className='flex flex-col items-center justify-center text-center mt-12'>
              <ErrorIcon />

              <p className='text-white mt-2'>Swap Failed</p>
              <p className='text-white/50 text-xs mt-2'>We were unable to complete the swap. Please try again.</p>
              {errorMessage ? <p className='text-white/50 text-xs mt-2'>{errorMessage}</p> : ''}

              <JupButton
                size="lg"
                className="w-full mt-6 disabled:opacity-50"
                type="button"
                onClick={onGoBack}
              >
                <SexyChameleonText>Retry</SexyChameleonText>
              </JupButton>
            </div>
          </div>
        ) : (
          <Content />
        )}
    </div>
  )
}

export default SwappingScreen