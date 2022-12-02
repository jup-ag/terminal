import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import JupiterApp from "./components/Jupiter";
import { ContextProvider } from "./contexts/ContextProvider";
import { ScreenProvider } from "./contexts/ScreenProvider";
import { TokenContextProvider } from "./contexts/TokenContextProvider";
import WalletPassthroughProvider from "./contexts/WalletPassthroughProvider";
import ChevronDownSolidIcon from "./icons/ChevronDownSolidIcon";
import ChevronUpSolidIcon from "./icons/ChevronUpSolidIcon";
import JupiterLogo from "./icons/JupiterLogo";

import { IInit, JupiterTerminal } from "./types";

const RenderJupiter = (props: IInit) => {
  return (
    <ContextProvider endpoint={props.endpoint}>
      <WalletPassthroughProvider>
        <TokenContextProvider>
          <ScreenProvider>
            <JupiterApp  {...props} />
          </ScreenProvider>
        </TokenContextProvider>
      </WalletPassthroughProvider>
    </ContextProvider>
  );
};

const RenderWidget = (props: IInit) => {
  const [isOpen, setIsOpen] = useState(false);

  const classes = useMemo(() => {
    const size = props.widgetStyle?.size || 'default';

    let result: { containerClassName: string, contentClassName: string, caretClassName: string } | undefined = undefined;
    if (!props.widgetStyle?.position || props.widgetStyle?.position === 'bottom-right') {
      result = {
        containerClassName: 'bottom-6 right-6',
        contentClassName: size === 'default' ? 'bottom-[60px] -right-3' : 'bottom-[44px] -right-4',
        caretClassName: size === 'default' ? 'bottom-[-18px] right-6' : 'bottom-[-18px] right-5',
      }
    }
    if (props.widgetStyle?.position === 'bottom-left') {
      result = {
        containerClassName: 'bottom-6 left-6',
        contentClassName: size === 'default' ? 'bottom-[60px] -left-3' : 'bottom-[44px] -left-4',
        caretClassName: size === 'default' ? 'bottom-[-18px] left-6' : 'bottom-[-18px] left-5',
      }
    }
    if (props.widgetStyle?.position === 'top-left') {
      result = {
        containerClassName: 'top-6 left-6',
        contentClassName: size === 'default' ? 'top-[60px] -left-3' : 'top-[44px] -left-4',
        caretClassName: size === 'default' ? 'top-[-18px] left-6' : 'top-[-18px] left-5',
      }
    }
    if (props.widgetStyle?.position === 'top-right') {
      result = {
        containerClassName: 'top-6 right-6',
        contentClassName: size === 'default' ? 'top-[60px] -right-3' : 'top-[44px] -right-4',
        caretClassName: size === 'default' ? 'top-[-18px] right-6' : 'top-[-18px] right-5',
      }
    }

    return {
      ...result,
      widgetContainerClassName: size === 'default' ? 'h-14 w-14' : 'h-10 w-10',
      widgetLogoSize: size === 'default' ? 42 : 32,
    }
  }, [props.widgetStyle?.position, props.widgetStyle?.size]);

  return (
    <>
      <div className={`fixed ${classes.containerClassName}`}>
        <div
          className={`${classes.widgetContainerClassName} rounded-full bg-[#282830] flex items-center justify-center cursor-pointer`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <JupiterLogo width={classes.widgetLogoSize} height={classes.widgetLogoSize} />
        </div>

        <div
          id="integrated-terminal"
          className={`absolute ${classes.contentClassName} flex w-[90vw] h-[600px] max-w-[384px] max-h-[75vh] rounded-2xl bg-[#282830] transition-opacity duration-300 shadow-2xl ${!isOpen ? "h-0 opacity-0" : "opacity-100"
            }`}
        >
          <RenderJupiter {...props} />

          {isOpen ? (
            <div className={`absolute ${classes.caretClassName} w-8 h-8 text-[#282830] fill-current transition-opacity duration-500 ${!isOpen ? "opacity-0" : "opacity-100"}`}>
              {props.widgetStyle?.position?.includes('bottom') ? <ChevronDownSolidIcon /> : <div className="rotate-180"><ChevronDownSolidIcon /></div>}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

const containerId = "jupiter-terminal";

const init: JupiterTerminal["init"] = (props) => {
  const { passThroughWallet, onSwapError, onSuccess, integratedTargetId, ...restProps } = props;

  if (props.mode === "outputOnly" && !props.mint) {
    throw new Error("outputOnly mode requires a mint!");
  }

  const targetDiv = document.createElement("div");
  const instanceExist = document.getElementById(containerId);

  // If there's existing instance, just show it
  if (instanceExist) {
    window.Jupiter.root?.unmount();
    window.Jupiter._instance = null;
    instanceExist?.remove();
  }

  targetDiv.id = containerId;
  targetDiv.classList.add('w-full')
  targetDiv.classList.add('h-full')

  if (restProps.displayMode === 'integrated') {
    const target = document.getElementById(integratedTargetId!);
    if (!target) {
      throw new Error(`Jupiter Terminal: document.getElementById cannot find ${integratedTargetId}`);
    }

    target?.appendChild(targetDiv);
  } else {
    document.body.appendChild(targetDiv);
  }

  let element;
  if (restProps.displayMode === 'widget') {
    element = <RenderWidget {...restProps} />;
  } else {
    element = <RenderJupiter {...props} />;
  }
  const root = createRoot(targetDiv);
  root.render(element);
  window.Jupiter.root = root;
  window.Jupiter._instance = element;

  // Passthrough & Callbacks
  window.Jupiter.passThroughWallet = passThroughWallet;
  window.Jupiter.onSwapError = onSwapError;
  window.Jupiter.onSuccess = onSuccess;
};

const resume: JupiterTerminal["resume"] = () => {
  const instanceExist = document.getElementById(containerId);
  if (instanceExist) {
    instanceExist.classList.remove("hidden");
    instanceExist.classList.add("block");
    return;
  }
};

const close: JupiterTerminal["close"] = () => {
  const targetDiv = document.getElementById(containerId);
  if (targetDiv) {
    targetDiv.classList.add("hidden");
  }
};

const Jupiter: JupiterTerminal = {
  _instance: null,
  passThroughWallet: null,
  root: null,
  init,
  resume,
  close,
};

export { Jupiter, init, close };
