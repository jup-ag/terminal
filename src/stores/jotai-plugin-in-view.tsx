import { atom } from 'jotai';

const pluginInViewAtom = atom<boolean>(false);

export const getPluginInView = (): boolean => {
  const store = window.Jupiter?.store;
  if (!store) {
    console.warn('Jupiter store is not available.');
    return false;
  }
  return store.get(pluginInViewAtom);
};

export const setPluginInView = (value: boolean): void => {
  const store = window.Jupiter?.store;
  if (!store) {
    console.warn('Jupiter store is not available.');
    return;
  }
  store.set(pluginInViewAtom, value);
};
