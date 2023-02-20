import { Wallet } from '@solana/wallet-adapter-react';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import JupButton from 'src/components/JupButton';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import { useDebouncedEffect } from 'src/misc/utils';
import { FormProps, WidgetPosition, WidgetSize } from 'src/types';

const WidgetTerminal = (props: { rpcUrl: string, formProps: FormProps, fakeWallet: Wallet | null }) => {
  const { rpcUrl, fakeWallet, formProps } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState<WidgetPosition>('bottom-right');
  const [size, setSize] = useState<WidgetSize>('default');

  const launchTerminal = () => {
    window.Jupiter.init({
      displayMode: 'widget',
      widgetStyle: {
        position,
        size,
      },
      formProps,
      passThroughWallet: fakeWallet,
      endpoint: rpcUrl,
    });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded || !window.Jupiter.init) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter.init));
      }, 500);
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, []);

  useDebouncedEffect(() => {
    if (isLoaded && Boolean(window.Jupiter.init)) {
      launchTerminal();
    }
  }, [isLoaded, props, position, size], 1000)

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
                className={classNames('absolute left-1 top-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'jup-gradient': position === 'top-left',
                })}
                onClick={() => setPosition('top-left')}
              >
                <div className="rotate-45">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Top right  */}
              <div
                className={classNames('absolute right-1 top-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'jup-gradient': position === 'top-right',
                })}
                onClick={() => setPosition('top-right')}
              >
                <div className="rotate-[135deg]">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Bottom left  */}
              <div
                className={classNames('absolute left-1 bottom-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'jup-gradient': position === 'bottom-left',
                })}
                onClick={() => setPosition('bottom-left')}
              >
                <div className="-rotate-45">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Bottom right  */}
              <div
                className={classNames('absolute right-1 bottom-1 cursor-pointer hover:bg-black/20 rounded-full p-1', {
                  'jup-gradient': position === 'bottom-right',
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
                type="button"
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
                type="button"
                className={size === 'default' ? 'bg-white/10' : 'opacity-20 hover:opacity-70'}
              >
                <div className="flex items-center space-x-2 text-xs">
                  <div>Default</div>
                </div>
              </JupButton>
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
