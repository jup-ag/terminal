import React from "react";

import JupiterApp from "./components/Jupiter";
import { ContextProvider } from "./contexts/ContextProvider";
import { ScreenProvider } from "./contexts/ScreenProvider";
import { TokenContextProvider } from "./contexts/TokenContextProvider";
import WalletPassthroughProvider from "./contexts/WalletPassthroughProvider";
import { IInit } from "./types";

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

const containerId = "jupiter-terminal";
const resume = () => {
  const instanceExist = document.getElementById(containerId);
  if (instanceExist) {
    instanceExist.classList.remove("hidden");
    instanceExist.classList.add("block");
    return;
  }
};

const close = () => {
  const targetDiv = document.getElementById(containerId);
  if (targetDiv) {
    targetDiv.classList.add("hidden");
  }
};

export { RenderJupiter, resume, close };
