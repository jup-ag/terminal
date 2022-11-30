import React from "react";
import { createRoot } from "react-dom/client";

import JupiterApp from "./components/Jupiter";
import { ContextProvider } from "./contexts/ContextProvider";
import { ScreenProvider } from "./contexts/ScreenProvider";
import { TokenContextProvider } from "./contexts/TokenContextProvider";
import WalletPassthroughProvider from "./contexts/WalletPassthroughProvider";

import { IInit, JupiterTerminal } from "./types";

const renderJupiterApp = (props: IInit) => {
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

const containerId = "jupiter-terminal";

const init: JupiterTerminal["init"] = (props) => {
  const { passThroughWallet, onSwapError, onSuccess, ...restProps } = props;

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
  document.body.appendChild(targetDiv);

  const element = renderJupiterApp(restProps);
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
