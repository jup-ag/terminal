import { JupiterProvider } from "@jup-ag/react-hook";

import { useConnection } from "@solana/wallet-adapter-react";

import React, { useMemo, useState } from "react";
import { WRAPPED_SOL_MINT } from "../constants";

import Header from "../components/Header";
import { AccountsProvider } from "../contexts/accounts";
import { useScreenState } from "src/contexts/ScreenProvider";
import InitialScreen from "./screens/InitialScreen";
import ReviewOrderScreen from "./screens/ReviewOrderScreen";
import { SwapContextProvider, useSwapContext } from "src/contexts/SwapContext";
import { ROUTE_CACHE_DURATION } from "src/misc/constants";
import SwappingScreen from "./screens/SwappingScreen";
import { useWalletPassThrough } from "src/contexts/WalletPassthroughProvider";
import { IInit } from "src/types";
import { SLippageConfigProvider } from "src/contexts/SlippageConfigProvider";

const Content = ({
  containerStyles,
}: {
  containerStyles: IInit["containerStyles"];
}) => {
  const { screen } = useScreenState();
  const { mode, mint } = useSwapContext();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const onClose = () => {
    window.Jupiter.close();
  };

  const zIndex = containerStyles?.zIndex || 50; // Default to 50, tailwind default max is 50.
  return (
    <div>
      <div
        style={{ zIndex }}
        className="flex flex-col h-screen w-screen max-h-[90vh] md:max-h-[600px] max-w-[360px] overflow-auto text-black relative bg-[#3A3B43] rounded-lg webkit-scrollbar"
      >
        {screen === "Initial" ? (
          <>
            <Header setIsWalletModalOpen={setIsWalletModalOpen} />
            <InitialScreen
              mint={mint || WRAPPED_SOL_MINT.toString()}
              isWalletModalOpen={isWalletModalOpen}
              setIsWalletModalOpen={setIsWalletModalOpen}
            />
          </>
        ) : null}

        {screen === "Confirmation" ? <ReviewOrderScreen /> : null}
        {screen === "Swapping" ? <SwappingScreen /> : null}
      </div>

      <div
        onClick={onClose}
        className="absolute w-screen h-screen top-0 left-0"
      />
    </div>
  );
};

const JupiterApp = ({
  mode,
  mint,
  containerStyles,
}: {
  mode: IInit['mode'],
  mint: IInit['mint'],
  containerStyles: IInit["containerStyles"];
}) => {
  const { wallet } = useWalletPassThrough();
  const { connection } = useConnection();

  const walletPublicKey = useMemo(
    () => wallet?.adapter.publicKey,
    [wallet?.adapter.publicKey]
  );

  return (
    <AccountsProvider>
      <SLippageConfigProvider>
        <JupiterProvider
          connection={connection}
          cluster={"mainnet-beta"}
          routeCacheDuration={ROUTE_CACHE_DURATION}
          wrapUnwrapSOL={false}
          userPublicKey={walletPublicKey || undefined}
        >
          <SwapContextProvider mode={mode} mint={mint}>
            <Content containerStyles={containerStyles} />
          </SwapContextProvider>
        </JupiterProvider>
      </SLippageConfigProvider>
    </AccountsProvider>
  );
};

export default JupiterApp;
