import { useLocalStorage } from '@jup-ag/wallet-adapter';
import { createContext, FC, PropsWithChildren, ReactNode, useContext } from 'react';
import { IInit } from 'src/types';

export interface NetworkConfigurationState {
  networkConfiguration: string;
  setNetworkConfiguration(networkConfiguration: string): void;
}

export const NetworkConfigurationContext = createContext<NetworkConfigurationState>({} as NetworkConfigurationState);

export function useNetworkConfiguration(): NetworkConfigurationState {
  return useContext(NetworkConfigurationContext);
}

export const NetworkConfigurationProvider: FC<PropsWithChildren<IInit>> = ({ localStoragePrefix, children }) => {
  const [networkConfiguration, setNetworkConfiguration] = useLocalStorage(
    `${localStoragePrefix}-network`,
    'mainnet-beta',
  );

  return (
    <NetworkConfigurationContext.Provider value={{ networkConfiguration, setNetworkConfiguration }}>
      {children}
    </NetworkConfigurationContext.Provider>
  );
};
