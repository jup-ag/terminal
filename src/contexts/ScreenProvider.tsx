import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from 'react';

type Screens = 'Initial' | 'Confirmation' | 'Swapping' | 'Success' | 'Error';

export interface ScreenProvider {
  screen: Screens;
  setScreen: Dispatch<SetStateAction<Screens>>;
}

export const ScreenStateContext = createContext<ScreenProvider>({ screen: 'Initial', setScreen() { } });

export function useScreenState(): ScreenProvider {
  return useContext(ScreenStateContext);
}

export const ScreenProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screens>('Initial');

  return (
    <ScreenStateContext.Provider value={{ screen, setScreen }}>
      {children}
    </ScreenStateContext.Provider>
  );
};
