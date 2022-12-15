import React, { useEffect, useState } from 'react'

const IntegratedTerminal = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter))
      }, 500)

      window.Jupiter.init({
        mode: 'default',
        displayMode: 'integrated',
        integratedTargetId: 'integrated-terminal',
        endpoint: "https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci",
      });
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, [])

  return (
    <div className='min-h-[600px] h-[600px] w-full bg-[#282830] rounded-2xl text-white flex flex-col items-center p-2 lg:p-4 mb-4 overflow-hidden'>
      <p className='font-semibold mb-2 w-full'>Example dApp</p>

      <div className='flex flex-col lg:flex-row h-full w-full overflow-auto'>
        <div className='rounded-xl w-auto flex lg:flex-col items-center'>
          <div className='text-xs flex lg:flex-col items-center justify-center p-2 rounded-xl bg-black/30'>
            <button type="button" className='bg-white/10 text-white rounded-xl py-2 px-4'>
              Swap
            </button>

            <button type="button" disabled className='cursor-not-allowed opacity-70 rounded-xl py-2 px-4'>
              Farms
            </button>

            <button type="button" disabled className='cursor-not-allowed opacity-70 rounded-xl py-2 px-4'>
              LP
            </button>
          </div>
        </div>


        <div className='w-full h-full rounded-xl overflow-hidden flex justify-center'>
          {/* Loading state */}
          {!isLoaded ? (
            <div className='h-full w-full animate-pulse bg-white/10 mt-4 lg:mt-0 lg:ml-4 flex items-center justify-center rounded-xl'>
              <p className=''>Loading...</p>
            </div>
          ) : null}

          <div id="integrated-terminal" className={`flex h-full w-full max-w-[384px] overflow-auto justify-center ${!isLoaded ? 'hidden' : ''}`} />
        </div>
      </div>
    </div>
  )
}

export default IntegratedTerminal