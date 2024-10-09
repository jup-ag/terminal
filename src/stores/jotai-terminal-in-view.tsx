import { atom } from 'jotai';

export const terminalInViewAtom = atom<boolean>(false);

export const useTerminalInView = () => {
  const store = window.Jupiter.store;

  return {
    terminalInView: store?.get(terminalInViewAtom),
    setTerminalInView: (value: boolean) => store?.set(terminalInViewAtom, value),
  };
};
