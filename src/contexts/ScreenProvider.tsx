import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from 'react';

export type Screens = 'Initial' | 'Swapping' | 'Success' | 'Error' | 'Wallet';

export interface ScreenProvider {
  screen: Screens;
  setScreen: Dispatch<SetStateAction<Screens>>;
}

export const ScreenStateContext = createContext<ScreenProvider>({ screen: 'Initial', setScreen() {} });

export function useScreenState(): ScreenProvider {
  return useContext(ScreenStateContext);
}

export const ScreenProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screens>('Initial');

  return <ScreenStateContext.Provider value={{ screen, setScreen }}>{children}</ScreenStateContext.Provider>;
};
