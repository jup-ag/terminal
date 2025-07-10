import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { IInit } from "src/types";

export interface BrandingContextState {
  logoUri?: string;
  name?: string;
}

export const BrandingContext = createContext<BrandingContextState>({} as BrandingContextState);

export const BrandingProvider = (props: PropsWithChildren<IInit>) => {
  const { branding ,children} = props;

  const logoUri = useMemo(() => branding?.logoUri? branding.logoUri : 'https://jup.ag/svg/jupiter-logo.svg', [branding?.logoUri]);
  const name = useMemo(() => branding?.name? branding.name : 'Jupiter', [branding?.name]);

  return <BrandingContext.Provider value={{ logoUri, name }}>{children}</BrandingContext.Provider>;
};
export function useBranding() {
  const context = useContext(BrandingContext);
  return context;
}