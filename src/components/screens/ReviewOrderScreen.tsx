import React from 'react'
import { useScreenState } from 'src/contexts/ScreenProvider'
import { useSwapContext } from 'src/contexts/SwapContext'
import LeftArrowIcon from 'src/icons/LeftArrowIcon'
import useTimeDiff from '../useTimeDiff/useTimeDiff'
import PriceInfo from '../PriceInfo/index'
import JupButton from '../JupButton'
import SexyChameleonText from '../SexyChameleonText/SexyChameleonText'

const ConfirmationScreen = () => {
  const {
    fromTokenInfo,
    toTokenInfo,
    onSubmit: onSubmitJupiter,
    selectedSwapRoute,
    jupiter: {
      routes,
      loading,
      refresh,
    }
  } = useSwapContext();

  const [hasExpired, timeDiff] = useTimeDiff();

  const { setScreen } = useScreenState();

  const onGoBack = () => {
    refresh();
    setScreen('Initial');
  }
  const onSubmit = () => {
    setScreen('Swapping');
    onSubmitJupiter();
  }

  return (
    <div className='flex flex-col h-full w-full py-4 px-2'>
      <div className='flex w-full justify-between'>
        <div className='text-white fill-current w-6 h-6 cursor-pointer' onClick={onGoBack}>
          <LeftArrowIcon width={24} height={24} />
        </div>

        <div className='text-white'>
          Review Order
        </div>

        <div className=' w-6 h-6' />
      </div>

      <div>
        {routes && selectedSwapRoute && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            routes={routes}
            selectedSwapRoute={selectedSwapRoute}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            loading={loading}
            showFullDetails
            containerClassName="bg-[#25252D] border-none"
          />
        ) : null}
      </div>

      {hasExpired
        ? (
          <JupButton
            size="lg"
            className="w-full mt-4 disabled:opacity-50 !p-0"
            type="button"
            onClick={onGoBack}
          >
            <span className='text-sm'>Refresh</span>
          </JupButton>
        )
        : (

          <JupButton
            size="lg"
            className="w-full mt-4 disabled:opacity-50"
            type="button"
            onClick={onSubmit}
          >
            <SexyChameleonText>Confirm</SexyChameleonText>
          </JupButton>
        )
      }
    </div >
  )
}

export default ConfirmationScreen