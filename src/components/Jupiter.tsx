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

const Content = () => {
  const { screen } = useScreenState();
  const { mint } = useSwapContext();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
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
      </>
  );
};

const JupiterApp = (props: IInit) => {
  const { mode, mint, displayMode, platformFeeAndAccounts } = props;
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
          routeCacheDuration={ROUTE_CACHE_DURATION}
          wrapUnwrapSOL={true}
          userPublicKey={walletPublicKey || undefined}
          platformFeeAndAccounts={platformFeeAndAccounts}
        >
          <SwapContextProvider displayMode={displayMode} mode={mode} mint={mint}>
            <Content />
          </SwapContextProvider>
        </JupiterProvider>
      </SLippageConfigProvider>
    </AccountsProvider>
  );
};

export default JupiterApp;
