import React, { useEffect, useState } from 'react'
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext'
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import JupButton from '../JupButton';
import Spinner from '../Spinner';
import TokenIcon from '../TokenIcon';

const SwappingScreen = () => {
  const {
    form,
    fromTokenInfo,
    toTokenInfo,
    lastSwapResult,
    reset,
    jupiter: {
      refresh,
    }
  } = useSwapContext();
  const { setScreen } = useScreenState();

  const [status, setStatus] = useState<'error' | 'success' | 'loading'>('loading');
  const [txid, setTxid] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onGoBack = () => {
    reset();
    setStatus('loading')
    setErrorMessage('');
    setScreen('Initial');
    refresh();
  }
  
  useEffect(() => {
    if (lastSwapResult && 'error' in lastSwapResult) {
      setStatus('error');
      setErrorMessage(lastSwapResult.error?.message || '');
      return;
    } else if (lastSwapResult && 'txid' in lastSwapResult) {
      setStatus('success');
      return;
    }
  }, [lastSwapResult])

  const onClose = () => {
    window.Jupiter.close();
    reset();
    setScreen('Initial');
  }

  const Content = () => {
    if (status === 'loading') {
      return (
        <div className='flex flex-col px-5 w-full items-center justify-center mt-24 text-center text-black'>
          <p className='text-lg font-semibold'>Performing Swap</p>
          <p className='mt-4'>Please approve the transaction <br/> on your wallet.</p>
          <Spinner width={120} height={120} />
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className='flex flex-col px-5 w-full items-center justify-center mt-24'>
          <p className='text-lg font-semibold'>Error performing swap</p>
          {errorMessage ? <p className='mt-4'>{errorMessage}</p> : null}

          <JupButton className='px-4 mt-12' size='md' onClick={onGoBack}>
            Go back
          </JupButton>
        </div>
      )
    }

    if (status === 'success') {
      return (
        <>
          <div className='text-xl font-bold mt-8'>Swap successful</div>

          <div className='flex flex-col w-full items-center justify-center mt-8 space-y-4'>
            <span className='flex items-center'>
              {form.fromValue}
              <div className="ml-1 font-semibold" translate="no">
                {fromTokenInfo?.symbol}
              </div>
            </span>
            <TokenIcon tokenInfo={fromTokenInfo} width={48} height={48} />
            <ChevronDownIcon />
            <TokenIcon tokenInfo={toTokenInfo} width={48} height={48} />
            <span className='flex items-center'>
              {form.toValue}
              <div className="ml-1 font-semibold" translate="no">
                {toTokenInfo?.symbol}
              </div>
            </span>
          </div>

          <JupButton className='mt-12' onClick={onClose}>
            Close
          </JupButton>
        </>
      )
    }

    return <></>;
  };


  return (
    <div className='flex flex-col items-center justify-center'>
      <Content />
    </div>
  )
}

export default SwappingScreen