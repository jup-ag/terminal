import React, { useEffect, useState } from "react";
import JupButton from "src/components/JupButton";
import { IInit, WidgetPosition, WidgetSize } from "src/types";

const WidgetTerminal = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState<WidgetPosition>('bottom-right');
  const [size, setSize] = useState<WidgetSize>('default');

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter));
      }, 500);

      window.Jupiter.init({
        mode: "default",
        displayMode: "widget",
        widgetStyle: {
          position: 'bottom-right',
          size: 'default',
        },
        endpoint:
          "https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci",
      });
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.Jupiter.init({
        mode: "default",
        displayMode: "widget",
        widgetStyle: {
          position,
          size,
        },
        endpoint:
          "https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci",
      });
    }
  }, [position, size])

  return (
    <div>
      <p>Click to open the widget on the {position}.</p>

      <hr className="my-4" />

      <h3 className="font-semibold">Position</h3>
      <div className='flex gap-2  flex-wrap mt-4'>
        <JupButton onClick={() => { setPosition('bottom-left') }} type='button' className={position === 'bottom-left' ? '' : 'opacity-20 hover:opacity-70'}>bottom-left</JupButton>
        <JupButton onClick={() => { setPosition('bottom-right') }} type='button' className={position === 'bottom-right' ? '' : 'opacity-20 hover:opacity-70'}>bottom-right</JupButton>
        <JupButton onClick={() => { setPosition('top-left') }} type='button' className={position === 'top-left' ? '' : 'opacity-20 hover:opacity-70'}>top-left</JupButton>
        <JupButton onClick={() => { setPosition('top-right') }} type='button' className={position === 'top-right' ? '' : 'opacity-20 hover:opacity-70'}>top-right</JupButton>
      </div>
      
      <hr className="my-4" />
      
      <h3 className="font-semibold">Size</h3>
      <div className='flex gap-2  flex-wrap mt-4'>
        <JupButton onClick={() => { setSize('sm') }} type='button' className={size === 'sm' ? '' : 'opacity-20 hover:opacity-70'}>sm</JupButton>
        <JupButton onClick={() => { setSize('default') }} type='button' className={size === 'default' ? '' : 'opacity-20 hover:opacity-70'}>default</JupButton>
      </div>
    </div>
  );
};

export default WidgetTerminal;
