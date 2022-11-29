import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import { SolflareWalletName } from '@solana/wallet-adapter-solflare';
import { PublicKey } from '@solana/web3.js';
import React, { createContext, FC, ReactNode, useContext, useMemo } from 'react'

interface IWalletPassThrough {
  publicKey: PublicKey | null;
  wallets: Wallet[];
  wallet: Wallet | null;
  connect: () => Promise<void>;
  select: (walletName: WalletName<string>) => void;
  connecting: boolean;
  connected: boolean;
  disconnect: () => Promise<void>;
}

const initialPassThrough = {
  publicKey: null,
  wallets: [],
  wallet: null,
  connect: async () => { },
  select: () => { },
  connecting: false,
  connected: false,
  disconnect: async () => { },
}

export const WalletPassthroughContext = createContext<IWalletPassThrough>(initialPassThrough);

export function useWalletPassThrough(): IWalletPassThrough {
  return useContext(WalletPassthroughContext);
}

const WalletPassthroughProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    publicKey,
    wallets,
    wallet,
    connect,
    select,
    connecting,
    connected,
    disconnect,
  } = useWallet();
  
  const value = (() => {
    // Pass through wallet adapter
    const passThroughWallet = window.Jupiter.passThroughWallet;
    const isSolflare = passThroughWallet?.adapter.name === 'Solflare';

    if (Boolean(passThroughWallet) && passThroughWallet?.adapter.publicKey) {
      // Solflare wallet does not allow pass through
      if (!isSolflare) {
        return {
          ...initialPassThrough,
          publicKey: passThroughWallet?.adapter.publicKey,
          wallet: {
            adapter: passThroughWallet.adapter,
            readyState: WalletReadyState.Loadable,
          },
          connecting: false,
          connected: true,
          disconnect: async () => {
            try {
              if (passThroughWallet?.adapter.disconnect) {
                return passThroughWallet?.adapter.disconnect();
              }
            } catch (error) {
              console.log(error);
            }
          },
        }
      }
    }

    // Original wallet adapter
    return {
      publicKey,
      wallets,
      wallet,
      connect,
      select,
      connecting,
      connected,
      disconnect,
    };
  })();

  return (
    <WalletPassthroughContext.Provider value={value}>
      {children}
    </WalletPassthroughContext.Provider>
  )
}

export default WalletPassthroughProvider