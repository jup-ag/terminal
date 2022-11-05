import React, { CSSProperties, useMemo } from "react";
import { createRoot, Root } from "react-dom/client";
import JupiterApp from "./components/Jupiter";
import { ContextProvider } from "./contexts/ContextProvider";
import { ScreenProvider } from "./contexts/ScreenProvider";
import { TokenContextProvider } from "./contexts/TokenContextProvider";
import WalletPassthroughProvider from "./contexts/WalletPassthroughProvider";

import { Wallet } from "@solana/wallet-adapter-react";
import "tailwindcss/tailwind.css";
import "src/styles/globals.css";

declare global {
  interface Window {
    Jupiter: JupiterEmbed;
  }
}

interface IInit {
  passThroughWallet?: Wallet | null;
  containerStyles?: { zIndex: CSSProperties["zIndex"] };
}

interface JupiterEmbed {
  containerId: string;
  _instance: React.ReactNode;
  passThroughWallet: Wallet | null;
  init: ({
    passThroughWallet,
    containerStyles,
  }: IInit) => void;
  close: () => void;
  root: Root | null;
}

const renderJupiterApp = ({ containerStyles }: { containerStyles: IInit['containerStyles'] }) => {
  const zIndex = containerStyles?.zIndex || 50; // Default to 50, tailwind default max is 50.

  return (
    <div
      style={{ zIndex }}
      className="absolute top-0 w-screen h-screen flex items-center justify-center bg-black/50"
    >
      <ContextProvider customEndpoint={"https://mango.rpcpool.com"}>
        <WalletPassthroughProvider>
          <TokenContextProvider>
            <ScreenProvider>
              <JupiterApp />
            </ScreenProvider>
          </TokenContextProvider>
        </WalletPassthroughProvider>
      </ContextProvider>
    </div>
  );
};
const containerId = "jupiter-embed";

const init: JupiterEmbed["init"] = ({
  passThroughWallet = null,
  containerStyles,
}) => {
  const targetDiv =
    document.getElementById(containerId) ?? document.createElement("div");

  const addedPassThrough =
    !window.Jupiter.passThroughWallet && passThroughWallet;
  const removedPassThrough =
    window.Jupiter.passThroughWallet && !passThroughWallet;
  window.Jupiter.passThroughWallet = passThroughWallet;

  if (addedPassThrough || removedPassThrough) {
    window.Jupiter.root?.unmount();
    window.Jupiter._instance = null;
    window.Jupiter.init({ passThroughWallet });
  }

  if (window.Jupiter._instance) {
    targetDiv.classList.remove("hidden");
    targetDiv.classList.add("block");
    return;
  }

  targetDiv.id = containerId;
  document.body.appendChild(targetDiv);

  const root = createRoot(targetDiv);
  window.Jupiter.root = root;

  const element =
    window.Jupiter._instance || renderJupiterApp({ containerStyles });
  root.render(element);
  window.Jupiter.containerId = containerId;
  window.Jupiter._instance = element;
};

const close: JupiterEmbed["close"] = () => {
  if (Jupiter._instance) {
    const targetDiv = document.getElementById(window.Jupiter.containerId);
    if (targetDiv) {
      targetDiv.classList.add("hidden");
    }
  }
};

const Jupiter: JupiterEmbed = {
  containerId: "",
  _instance: null,
  passThroughWallet: null,
  root: null,
  init,
  close,
};

export { Jupiter, init, close };
