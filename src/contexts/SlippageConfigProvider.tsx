import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from 'react';

export const DEFAULT_SLIPPAGE = 0.5;

export interface NetworkConfigurationState {
  slippage: number;
  setSlippage: Dispatch<SetStateAction<number>>
}

export const SlippageConfigContext = createContext<NetworkConfigurationState>({} as NetworkConfigurationState);

export function useSlippageConfig(): NetworkConfigurationState {
  return useContext(SlippageConfigContext);
}

export const SlippageConfigProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  return (
    <SlippageConfigContext.Provider value={{ slippage, setSlippage }}>{children}</SlippageConfigContext.Provider>
  );
};
