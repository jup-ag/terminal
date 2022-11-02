import React from 'react'
import { useScreenState } from 'src/contexts/ScreenProvider'
import { useSwapContext } from 'src/contexts/SwapContext'
import FormError from '../FormError'
import JupButton from '../JupButton'
import SpinnerProgress from '../SpinnerProgress/SpinnerProgress'
import TokenIcon from '../TokenIcon'
import useTimeDiff from '../useTimeDiff/useTimeDiff'

const ConfirmationScreen = () => {
  const {
    form,
    fromTokenInfo,
    toTokenInfo,
    onSubmit: onSubmitJupiter,
    jupiter: {
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
    <div className='flex flex-col items-center mt-4'>
      <div className='px-5 flex w-full items-center justify-between'>
        <div className='flex flex-1'>
          <div className='flex items-center justify-center border border-black/50 rounded-full p-1.5 cursor-pointer' onClick={onGoBack}>
            <svg width="10" height="10" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1L1 7L7 13" stroke="#1A202C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <span className='text-lg font-semibold flex-1'>Review Order</span>

        <div className='flex-1' />
      </div>

      <div className="h-full mt-4 mx-5 flex flex-col items-center justify-center">
        <div className="w-full rounded-xl bg-white/75 dark:bg-white dark:bg-opacity-5 shadow-lg flex flex-col p-4 pb-2">
          <div className="flex-col">
            <div className="flex justify-between items-end pb-3 text-xs text-gray-400">
              <div className="text-sm font-semibold text-black dark:text-white">
                <span>You pay</span>
              </div>
            </div>
          </div>

          <div className="border-b border-transparent">
            <div className="px-3 border-transparent rounded-xl bg-[#EBEFF1] dark:bg-black/25">
              <div>
                <div className="flex flex-col dark:text-white">
                  <div className="py-3 flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-2 rounded-lg flex items-center hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <TokenIcon tokenInfo={fromTokenInfo} />
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {fromTokenInfo?.symbol}
                      </div>
                    </button>

                    <div className="text-right">
                      <input
                        placeholder="0.00"
                        className="h-full w-full bg-transparent disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-lg undefined"
                        value={form.fromValue}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center items-center my-4">
            <div className="rounded-full border border-black/50 p-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.82439 12.8841H5.20898V1.03866C5.20898 0.741169 5.45015 0.5 5.74764 0.5H6.2863H6.28576C6.42848 0.5 6.56575 0.556873 6.66692 0.657494C6.76754 0.758663 6.82441 0.895374 6.82441 1.03866V12.8846L6.82439 12.8841Z"
                  fill="rgba(0,0,0,0.5)"
                />
                <path
                  d="M6.04088 14.4998C5.8473 14.5048 5.66082 14.4266 5.52958 14.2844L0.441037 8.60366C0.250727 8.32476 0.29722 7.94743 0.549314 7.72267C0.801418 7.49736 1.18148 7.49463 1.43741 7.71556L6.01399 12.8308L10.5638 7.71556C10.8198 7.49464 11.1998 7.49737 11.4519 7.72267C11.704 7.94743 11.7505 8.32476 11.5602 8.60366L6.52585 14.2844H6.5253C6.39406 14.4266 6.20758 14.5048 6.014 14.4998H6.04088Z"
                  fill="rgba(0,0,0,0.5)"
                />
              </svg>
            </div>
          </div>

          <div className="flex justify-between pb-0 text-xs text-gray-400">
            <div className="text-sm font-semibold text-black dark:text-white">
              You receive
            </div>
          </div>

          <div className="pt-3 flex justify-between items-center">
            <button
              type="button"
              className="py-2 px-2 rounded-lg flex items-center cursor-default"
            >
              <TokenIcon tokenInfo={toTokenInfo} />

              <div className="ml-4 mr-2 font-semibold" translate="no">
                {toTokenInfo?.symbol}
              </div>
            </button>

            <div className="text-right">
              {Number(form.toValue) > 0 ? (
                <input
                  placeholder="0.00"
                  className="h-full w-full bg-transparent disabled:opacity-100 disabled:text-black dark:text-white text-right font-semibold dark:placeholder:text-white/25 text-lg undefined"
                  value={form.toValue}
                  disabled
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* // TODO: Work on expiration */}
        {hasExpired
          ? (
            <>
              <FormError errors={{ 'hasExpired': { title: 'Quote Expired', message: 'Your quote has expired, go back and pick a new route.', } }} />
              <JupButton
                size="lg"
                className="w-full mt-4"
                type="button"
                onClick={onGoBack}
              >
                Go back
              </JupButton>
            </>
          ) : (
            <JupButton
              size="lg"
              className="w-full mt-4"
              type="button"
              onClick={onSubmit}
            >
              <div className='flex justify-center items-center space-x-2'>
                <div>Confirm Swap</div>
                <SpinnerProgress percentage={timeDiff} />
              </div>
            </JupButton>
          )}
      </div>
    </div>
  )
}

export default ConfirmationScreen