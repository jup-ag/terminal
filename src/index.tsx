import React from "react";
import { createRoot } from "react-dom/client";
import JupiterApp from "./components/Jupiter";
import { ContextProvider } from "./contexts/ContextProvider";
import { ScreenProvider } from "./contexts/ScreenProvider";
import { TokenContextProvider } from "./contexts/TokenContextProvider";
import WalletPassthroughProvider from "./contexts/WalletPassthroughProvider";

import { IInit, JupiterEmbed } from "./types";

const renderJupiterApp = ({ containerStyles }: { containerStyles: IInit['containerStyles'] }) => {
  const zIndex = containerStyles?.zIndex || 50; // Default to 50, tailwind default max is 50.

  return (
    <div
      style={{ zIndex }}
      className="fixed top-0 w-screen h-screen flex items-center justify-center bg-black/50"
    >
      <ContextProvider customEndpoint={"https://mango.rpcpool.com"}>
        <WalletPassthroughProvider>
          <TokenContextProvider>
            <ScreenProvider>
              <JupiterApp containerStyles={{ zIndex }} />
            </ScreenProvider>
          </TokenContextProvider>
        </WalletPassthroughProvider>
      </ContextProvider>
    </div>
  );
};
const containerId = "jupiter-embed";

const init: JupiterEmbed["init"] = (props) => {
  const { passThroughWallet, containerStyles } = props || { passThroughWallet: undefined, containerStyles: undefined };

  const targetDiv = document.createElement("div");
  const instanceExist = document.getElementById(containerId);

  const addedPassThrough =
    !window.Jupiter.passThroughWallet && passThroughWallet;
  const removedPassThrough =
    window.Jupiter.passThroughWallet && !passThroughWallet;
  window.Jupiter.passThroughWallet = passThroughWallet;

  if (addedPassThrough || removedPassThrough) {
    window.Jupiter.root?.unmount();
    window.Jupiter._instance = null;
    instanceExist?.remove();
    window.Jupiter.init({ passThroughWallet });
    return;
  }

  // If there's existing instance, just show it
  if (instanceExist) {
    instanceExist.classList.remove("hidden");
    instanceExist.classList.add("block");
    return;
  }

  targetDiv.id = containerId;
  document.body.appendChild(targetDiv);

  const root = createRoot(targetDiv);
  window.Jupiter.root = root;

  const element =
    window.Jupiter._instance || renderJupiterApp({ containerStyles });
  root.render(element);
  window.Jupiter._instance = element;
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
  close,
};

export { Jupiter, init, close };
