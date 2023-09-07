import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet, Wallet } from '@jup-ag/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { useAtom } from 'jotai';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { appProps } from 'src/library';

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
  connect: async () => {},
  select: () => {},
  connecting: false,
  connected: false,
  disconnect: async () => {},
};

export const WalletPassthroughContext = createContext<IWalletPassThrough>(initialPassThrough);

export function useWalletPassThrough(): IWalletPassThrough {
  return useContext(WalletPassthroughContext);
}

const FromWalletAdapter: FC<PropsWithChildren> = ({ children }) => {
  const { publicKey, wallets, wallet, connect, select, connecting, connected, disconnect } = useWallet();

  return (
    <WalletPassthroughContext.Provider
      value={{
        publicKey,
        wallets,
        wallet,
        connect,
        select,
        connecting,
        connected,
        disconnect,
      }}
    >
      {children}
    </WalletPassthroughContext.Provider>
  );
};

const WalletPassthroughProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [atom] = useAtom(appProps);
  const wallet = atom?.passthroughWalletContextState?.wallet

  const walletPassthrough: IWalletPassThrough = useMemo(() => {
    return {
      ...initialPassThrough,
      publicKey: wallet?.adapter.publicKey || null,
      wallet: wallet?.adapter
        ? {
            adapter: wallet?.adapter,
            readyState: WalletReadyState.Loadable,
          }
        : null,
      connecting: false,
      connected: true,
      disconnect: async () => {
        try {
          if (wallet?.adapter?.disconnect) {
            return wallet?.adapter?.disconnect();
          }
        } catch (error) {
          console.log(error);
        }
      },
    };
  }, [atom]);

  if (!window.Jupiter.enableWalletPassthrough) {
    return <FromWalletAdapter>{children}</FromWalletAdapter>;
  }

  if (walletPassthrough) {
    return <WalletPassthroughContext.Provider value={walletPassthrough}>{children}</WalletPassthroughContext.Provider>;
  }

  return <>{children}</>;
};

export default WalletPassthroughProvider;
