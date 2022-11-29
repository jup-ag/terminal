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

const deepCopy = (props: any) => JSON.parse(JSON.stringify(props));
const init: JupiterEmbed["init"] = (props) => {
  const { mode, mint, endpoint, passThroughWallet, containerStyles, containerClassName } = props;

  if (mode === "outputOnly" && !mint) {
    throw new Error("outputOnly mode requires a mint!");
  }

  const targetDiv = document.createElement("div");
  const instanceExist = document.getElementById(containerId);

  const passThroughWalletChanged = (() => {
    const current = window.Jupiter.passThroughWallet;
    if (
      current?.adapter.publicKey.toString() !==
      passThroughWallet?.adapter?.publicKey?.toString()
    ) {
      window.Jupiter.passThroughWallet = passThroughWallet;
      return true;
    }
    return false;
  })();

  const propChanged = (() => {
    const oldProps = window.Jupiter.previousProps;
    if (!oldProps) return false;

    window.Jupiter.previousProps = deepCopy({ mode, mint, endpoint, containerStyles });
    return oldProps?.mode !== mode || oldProps?.mint !== mint || oldProps.endpoint !== endpoint || oldProps.containerStyles !== containerStyles;
  })();

  // If props changed, we have to reinit the app.
  if (passThroughWalletChanged || propChanged) {
    window.Jupiter.root?.unmount();
    window.Jupiter._instance = null;
    instanceExist?.remove();
    window.Jupiter.init({
      mode,
      mint,
      endpoint,
      passThroughWallet,
      containerStyles,
      containerClassName,
    });
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
    window.Jupiter._instance ||
    renderJupiterApp({ mode, mint, endpoint, containerStyles, containerClassName });
  root.render(element);
  window.Jupiter._instance = element;
  window.Jupiter.previousProps = deepCopy({ mode, mint, endpoint, containerStyles, containerClassName });
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
  previousProps: null,
  init,
  close,
};

export { Jupiter, init, close };
