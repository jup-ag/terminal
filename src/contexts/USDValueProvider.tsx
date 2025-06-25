import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDebounce, useLocalStorage } from 'react-use';
import { splitIntoChunks } from 'src/misc/utils';
import { useAccounts } from './accounts';
import { useSwapContext } from './SwapContext';
import { useTokenContext } from './TokenContextProvider';
import { IInit } from 'src/types';
import { WRAPPED_SOL_MINT } from 'src/constants';

const MAXIMUM_PARAM_SUPPORT = 100;
const CACHE_EXPIRE_TIME = 1000 * 60 * 1; // 1 min

interface CacheUSDValue {
  usd: number;
  timestamp: number;
}

export interface ITokenUSDValue {
  [key: string]: CacheUSDValue | undefined;
}

export interface USDValueState {
  tokenPriceMap: ITokenUSDValue;
  getUSDValue(cgId: string | string[]): void;
}

export const USDValueProviderContext = createContext<USDValueState>({} as USDValueState);

export function useUSDValueProvider(): USDValueState {
  return useContext(USDValueProviderContext);
}

interface JupPriceResponse {
  [id: string]: { id: string; mintSymbol: string; vsToken: string; vsTokenSymbol: string; price: number };
}

const hasExpired = (timestamp: number) => {
  if (new Date().getTime() - timestamp >= CACHE_EXPIRE_TIME) {
    return true;
  }

  return false;
};

export const USDValueProvider: FC<PropsWithChildren<IInit>> = ({ children }) => {
  const { accounts } = useAccounts();
  const { getTokenInfo } = useTokenContext();
  const { fromTokenInfo, toTokenInfo } = useSwapContext();

  const [cachedPrices, setCachedPrices] = useLocalStorage<ITokenUSDValue>(`${window.Jupiter.localStoragePrefix}-cached-token-prices`, {});
  const [addresses, setAddresses] = useState<Set<string>>(new Set());
  const [debouncedAddresses, setDebouncedAddresses] = useState<string[]>([]);

  useDebounce(
    () => {
      setDebouncedAddresses(Array.from(addresses));
    },
    250,
    [addresses],
  );

  const getPriceFromJupAPI = useCallback(async (addresses: string[]) => {
    const { data }: { data: JupPriceResponse } = await fetch(
      `https://lite-api.jup.ag/price/v2?ids=${addresses.join(',')}`,
    ).then((res) => res.json());

    const nowTimestamp = new Date().getTime();
    const result = addresses.reduce<{ result: Record<string, CacheUSDValue>; failed: string[] }>(
      (accValue, address, idx) => {
        const priceForAddress = data[address];
        if (!priceForAddress) {
          return {
            ...accValue,
            failed: [...accValue.failed, addresses[idx]],
          };
        }

        return {
          ...accValue,
          result: {
            ...accValue.result,
            [priceForAddress.id]: {
              usd: priceForAddress.price,
              timestamp: nowTimestamp,
            },
          },
        };
      },
      { result: {}, failed: [] },
    );

    return result;
  }, []);

  const { data: tokenPriceMap, isFetched: isLatest } = useQuery<ITokenUSDValue>(
    [debouncedAddresses, Object.keys(cachedPrices || {}).length],
    async () => {
      let results: ITokenUSDValue = {};
      const tokenAddressToFetch: string[] = [];

      debouncedAddresses.forEach((address) => {
        // could be empty string
        if (address) {
          const cachePrice = (cachedPrices || {})[address];

          if (!cachePrice) {
            tokenAddressToFetch.push(address);
            return;
          }

          if (hasExpired(cachePrice.timestamp)) {
            tokenAddressToFetch.push(address);
            return;
          }

          results = {
            ...results,
            [address]: {
              usd: cachePrice.usd,
              timestamp: cachePrice.timestamp,
            },
          };
        }
      });

      if (!tokenAddressToFetch.length) return results;

      try {
        // Fetch from JUP
        const fetchFromJup = splitIntoChunks(tokenAddressToFetch, MAXIMUM_PARAM_SUPPORT);

        const allResults = await Promise.all(
          fetchFromJup.map(async (batch) => {
            return await getPriceFromJupAPI(batch);
          }),
        );
        allResults.forEach(({ result }) => {
          results = {
            ...results,
            ...result,
          };
        });
      } catch (error) {
        console.log('Error fetching prices from Jupiter Pricing API', error);
      }
      return results;
    },
    {
      staleTime: CACHE_EXPIRE_TIME,
      refetchInterval: CACHE_EXPIRE_TIME,
    },
  );

  // Clear the expired cache on first load
  useEffect(() => {
    setCachedPrices((prevState) =>
      Object.entries(prevState || {})
        .filter(([mint, usdCacheValue]) => !hasExpired(usdCacheValue?.timestamp ?? 0))
        .reduce(
          (accValue, [mint, usdCacheValue]) => ({
            ...accValue,
            [mint]: usdCacheValue,
          }),
          {},
        ),
    );
  }, [setCachedPrices]);

  // Make sure form token always have USD values
  useEffect(() => {
    setAddresses((prev) => {
      const newSet = new Set([...prev, WRAPPED_SOL_MINT.toString()]);
      if (fromTokenInfo?.address) newSet.add(fromTokenInfo?.address);
      if (toTokenInfo?.address) newSet.add(toTokenInfo?.address);
      return newSet;
    });
  }, [fromTokenInfo, toTokenInfo]);

  // use memo so that it avoid a rerendering
  const priceMap = useMemo(() => {
    return {
      ...cachedPrices,
      ...tokenPriceMap,
    };
  }, [tokenPriceMap, cachedPrices]);

  const getUSDValue = useCallback((tokenAddresses: string | string[]) => {
    setAddresses((prev) => {
      let newTokenAddresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];
      return new Set([...prev, ...newTokenAddresses]);
    });
  }, []);

  useEffect(() => {
    if (!Object.keys(accounts).length) return;

    const userAccountAddresses: string[] = Object.keys(accounts)
      .map((key) => {
        const token = getTokenInfo(key);

        if (!token) return undefined;

        return token.address;
      })
      .filter(Boolean) as string[];

    // Fetch USD value
    getUSDValue(userAccountAddresses);

    setAddresses((prev) => {
      return new Set([...prev, ...userAccountAddresses]);
    });
  }, [accounts, getTokenInfo, getUSDValue]);

  return (
    <USDValueProviderContext.Provider value={{ tokenPriceMap: priceMap, getUSDValue }}>
      {children}
    </USDValueProviderContext.Provider>
  );
};

export function useUSDValue() {
  const context = useContext(USDValueProviderContext);
  return context;
}
