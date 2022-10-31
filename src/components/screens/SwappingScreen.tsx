import React, { useEffect, useState } from 'react'
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
  } = useSwapContext();

  const [status, setStatus] = useState<'error' | 'success' | 'loading'>('loading');
  const [txid, setTxid] = useState('');

  useEffect(() => {
    if (lastSwapResult && 'error' in lastSwapResult) {
      setStatus('error');
      return;
    } else if (lastSwapResult && 'txid' in lastSwapResult) {
      setStatus('success');
      return;
    }
  }, [lastSwapResult])

  const onClose = () => {
    window.Jupiter.close();
    reset();
  }

  const Content = () => {
    if (status === 'loading') {
      return (
        <div>
          <Spinner width={120} height={120} />
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