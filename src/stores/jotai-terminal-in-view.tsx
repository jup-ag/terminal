import { atom } from 'jotai';

const terminalInViewAtom = atom<boolean>(false);

export const getTerminalInView = (): boolean => {
  const store = window.Jupiter?.store;
  if (!store) {
    console.warn('Jupiter store is not available.');
    return false; // Default value when store is unavailable
  }
  return store.get(terminalInViewAtom);
};

export const setTerminalInView = (value: boolean): void => {
  const store = window.Jupiter?.store;
  if (!store) {
    console.warn('Jupiter store is not available.');
    return;
  }
  store.set(terminalInViewAtom, value);
};
