import React from "react";
import { createRoot } from "react-dom/client";

import JupiterApp from "./components/Jupiter";
import { ContextProvider } from "./contexts/ContextProvider";
import { ScreenProvider } from "./contexts/ScreenProvider";
import { TokenContextProvider } from "./contexts/TokenContextProvider";
import WalletPassthroughProvider from "./contexts/WalletPassthroughProvider";

import { IInit, JupiterEmbed } from "./types";

const renderJupiterApp = ({
  mode,
  mint,
  endpoint,
  containerStyles,
  containerClassName,
}: {
  mode: IInit["mode"];
  mint: IInit["mint"];
  endpoint: string;
  containerStyles: IInit["containerStyles"];
  containerClassName: IInit["containerClassName"];
}) => {
  return (
    <ContextProvider endpoint={endpoint}>
      <WalletPassthroughProvider>
        <TokenContextProvider>
          <ScreenProvider>
            <JupiterApp
              mode={mode}
              mint={mint}
              containerStyles={containerStyles}
              containerClassName={containerClassName}
            />
          </ScreenProvider>
        </TokenContextProvider>
      </WalletPassthroughProvider>
    </ContextProvider>
  );
};

const containerId = "jupiter-easy-modal";

const init: JupiterEmbed["init"] = (props) => {
  const { mode, mint, endpoint, passThroughWallet, containerStyles, containerClassName } = props;

  if (mode === "outputOnly" && !mint) {
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

  const element = renderJupiterApp({ mode, mint, endpoint, containerStyles, containerClassName });
  const root = createRoot(targetDiv);
  root.render(element);
  window.Jupiter.root = root;
  window.Jupiter.passThroughWallet = passThroughWallet;
  window.Jupiter._instance = element;
};

const resume: JupiterEmbed["resume"] = () => {
  const instanceExist = document.getElementById(containerId);
  if (instanceExist) {
    instanceExist.classList.remove("hidden");
    instanceExist.classList.add("block");
    return;
  }
};

const close: JupiterEmbed["close"] = () => {
  const targetDiv = document.getElementById(containerId);
  if (targetDiv) {
    targetDiv.classList.add("hidden");
  }
};

const Jupiter: JupiterEmbed = {
  _instance: null,
  passThroughWallet: null,
  root: null,
  init,
  resume,
  close,
};

export { Jupiter, init, close };
