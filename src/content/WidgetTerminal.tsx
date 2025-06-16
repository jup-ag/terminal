import { useUnifiedWalletContext, useUnifiedWallet } from '@jup-ag/wallet-adapter';
import React, { useCallback, useEffect, useState } from 'react';
import JupButton from 'src/components/JupButton';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import { cn } from 'src/misc/cn';
import { DEFAULT_EXPLORER, FormProps, WidgetPosition, WidgetSize } from 'src/types';

const WidgetTerminal = (props: {
  formProps: FormProps;
  simulateWalletPassthrough: boolean;

  defaultExplorer: DEFAULT_EXPLORER;
}) => {
  const { formProps, simulateWalletPassthrough, defaultExplorer } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState<WidgetPosition>('bottom-right');
  const [size, setSize] = useState<WidgetSize>('default');
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(70);

  const passthroughWalletContextState = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();

  const launchTerminal = useCallback(() => {
    window.Jupiter.init({
      displayMode: 'widget',
      widgetStyle: {
        position,
        size,
        offset: {
          x: offsetX,
          y: offsetY,
        },
      },
      formProps,
      enableWalletPassthrough: simulateWalletPassthrough,
      passthroughWalletContextState: simulateWalletPassthrough ? passthroughWalletContextState : undefined,
      onRequestConnectWallet: () => setShowModal(true),

      defaultExplorer,
    });
  }, [
    defaultExplorer,
    formProps,
    passthroughWalletContextState,
    position,
    setShowModal,
    simulateWalletPassthrough,
    size,
    offsetX,
    offsetY,
  ]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded || !window.Jupiter.init || !intervalId) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter.init));
      }, 500);
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, [isLoaded]);

  useEffect(() => {
    setTimeout(() => {
      if (isLoaded && Boolean(window.Jupiter.init)) {
        launchTerminal();
      }
    }, 200);
  }, [isLoaded, props, position, size, launchTerminal]);

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState, props]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex mt-9 px-2 md:px-0">
        <div>
          <div className="relative mt-8 md:mt-0">
            <div className="bg-white/10 rounded-xl flex items-center justify-center w-full md:w-[384px] h-[216px]">
              <span className="text-xs text-white/50 text-center w-[70%]">
                Click on the arrows to see how the Jupiter Widget will appear on your web browser.
                <br />
                Click on the logo to view the Jupiter Swap Modal.
              </span>

              {/* Top left  */}
              <div
                className={cn('absolute left-1 top-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'ring-1 ring-white/50': position === 'top-left',
                })}
                onClick={() => setPosition('top-left')}
              >
                <div className="rotate-45">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Top right  */}
              <div
                className={cn('absolute right-1 top-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'ring-1 ring-white/50': position === 'top-right',
                })}
                onClick={() => setPosition('top-right')}
              >
                <div className="rotate-[135deg]">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Bottom left  */}
              <div
                className={cn('absolute left-1 bottom-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'ring-1 ring-white/50': position === 'bottom-left',
                })}
                onClick={() => setPosition('bottom-left')}
              >
                <div className="-rotate-45">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Bottom right  */}
              <div
                className={cn('absolute right-1 bottom-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'ring-1 ring-white/50': position === 'bottom-right',
                })}
                onClick={() => setPosition('bottom-right')}
              >
                <div className="rotate-[225deg]">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Set Size</span>

            <div className="space-x-2 p-1.5 mt-2 bg-black/30 rounded-xl">
              <JupButton
                size="sm"
                onClick={() => {
                  setSize('sm');
                }}
                className={size === 'sm' ? 'bg-white/10' : 'opacity-20 hover:opacity-70'}
              >
                <div className="flex items-center space-x-2 text-xs">
                  <div>Small</div>
                </div>
              </JupButton>
              <JupButton
                size="sm"
                onClick={() => {
                  setSize('default');
                }}
                className={size === 'default' ? 'bg-white/10' : 'opacity-20 hover:opacity-70'}
              >
                <div className="flex items-center space-x-2 text-xs">
                  <div>Default</div>
                </div>
              </JupButton>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-semibold">Set Offset</span>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-white/50">X:</span>
                <input
                  type="number"
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-black/30 rounded text-xs text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-white/50">Y:</span>
                <input
                  type="number"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-black/30 rounded text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 py-4">
        <div className="border-b border-white/10" />
      </div>
    </div>
  );
};

export default WidgetTerminal;
