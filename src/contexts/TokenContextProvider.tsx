import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ENV as ChainID, TokenInfo, TokenListContainer } from '@solana/spl-token-registry';
import { useLocalStorage } from '@jup-ag/wallet-adapter';
import { IInit } from 'src/types';
import { useInterval } from 'react-use';
import { splitIntoChunks } from 'src/misc/utils';
import { useSearchAdapter } from './search';
import { SearchResponse } from 'typesense/lib/Typesense/Documents';
import { checkIsBannedToken } from 'src/misc/tokenTags';
import TypesenseInstantsearchAdapter from 'typesense-instantsearch-adapter';
import { useQuery } from '@tanstack/react-query';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
export const CLUSTER_TO_CHAIN_ID: Record<ENV, ChainID> = {
  'mainnet-beta': ChainID.MainnetBeta,
  testnet: ChainID.Testnet,
  devnet: ChainID.Devnet,
  localnet: ChainID.Devnet,
};

const TokenContext = React.createContext<{
  tokenMap: Map<string, TokenInfo>;
  unknownTokenMap: Map<string, TokenInfo>;
  isLoaded: boolean;
  getTokenInfo: (mint: string) => TokenInfo | undefined;
  addOnchainTokenInfo: (tokenInfo: TokenInfo) => void;
  typesenseInstantsearchAdapter: TypesenseInstantsearchAdapter;
} | null>(null);

const isAddress = (str: string) => str.length >= 32 && str.length <= 48 && !str.includes('_');

export function TokenContextProvider({ formProps, children }: IInit & { children: ReactNode }) {
  const typesenseInstantsearchAdapter = useSearchAdapter();

  const [isLoaded, setIsLoaded] = useState(false);
  const tokenMap = useRef<Map<string, TokenInfo>>(
    (() => {
      const tempMap = new Map<string, TokenInfo>();
      // initialTokenInfos?.forEach((item) => tempMap.set(item.address, item)); // TODO: Implement this
      return tempMap;
    })(),
  );
  const unknownTokenMap = useRef<Map<string, TokenInfo>>(new Map());
  const onChainTokenMap = useRef<Map<string, TokenInfo>>(new Map());

  // Make sure initialTokenList are only fetched once
  const [localTokenList, setLocalTokenList] = useLocalStorage<{ timestamp: number | null; data: TokenInfo[] }>(
    'local-token-list',
    { timestamp: null, data: [] },
  );
  const { data: initialTokenList } = useQuery(
    ['cached-initial-token-list'],
    async () => {
      let results;

      // 10 minutes caching
      if (
        localTokenList.data.length > 0 &&
        localTokenList.timestamp &&
        Date.now() - localTokenList.timestamp < 600_000
      ) {
        results = localTokenList.data;
      } else {
        const tokens = await (await fetch('https://tokens.jup.ag/tokens?tags=strict,lst')).json();
        const res = new TokenListContainer(tokens);
        const list = res.getList();
        setLocalTokenList({ timestamp: Date.now(), data: list });
        results = list;
      }

      // Explicitly request for initial input/output token in case they are not in the prebundled or local.
      const toRequest = [formProps?.initialInputMint, formProps?.initialOutputMint]
        .filter(Boolean)
        .filter((item) => results.find((token) => token.address === item) === undefined);
      const requested = toRequest.length > 0 ? await requestTokenInfo(toRequest as string[]) : [];

      console.log('#', toRequest.length);
      return results.concat(requested);
    },
    {
      retry: 2,
    },
  );

  useEffect(() => {
    if (initialTokenList) {
      tokenMap.current = initialTokenList.reduce((acc, item) => {
        acc.set(item.address, item);
        return acc;
      }, new Map());
      setIsLoaded(true);
    }
  }, [initialTokenList]);

  const requestTokenInfo = useCallback(
    async (mintAddresses: string[]): Promise<TokenInfo[]> => {
      const filteredAddreses = Array.from(
        new Set(
          mintAddresses
            .filter((mint) => !tokenMap.current.has(mint)) // we already have it
            .filter(Boolean), // filter empty string
        ),
      );
      if (filteredAddreses.length === 0) return [];
      // Memoize that we have tried to request before, let's not request the same mint again
      filteredAddreses.forEach((mint) => requestedTokenInfo.current.add(mint));

      const chunks = splitIntoChunks([...filteredAddreses], 50);
      const result: TokenInfo[] = [];

      for (const chunk of chunks) {
        try {
          const response = await typesenseInstantsearchAdapter.typesenseClient.multiSearch.perform({
            searches: chunk.map((mint) => ({
              collection: 'tokens',
              q: mint,
              query_by: 'address',
              filter_by: `address:${mint}`,
            })),
          });

          // Set it into tokenMap
          response.results.forEach((searchResult: SearchResponse<TokenInfo>) => {
            if (!searchResult.hits || !searchResult.hits[0]) return;
            const item = searchResult.hits[0].document;
            unknownTokenMap.current.set(item.address, item);
            result.push(item);
          });
        } catch (error) {
          console.log('Typesense failed to fetch token info', error);
        }
      }

      return result;
    },
    [typesenseInstantsearchAdapter.typesenseClient.multiSearch],
  );

  const tokenInfoToRequests = useRef<string[]>([]);
  const requestedTokenInfo = useRef<Set<string>>(new Set());
  // Another way to do this is to use useDebounce
  // This make sure existing getTokenInfo will work gracefully
  useInterval(() => {
    if (tokenInfoToRequests.current.length > 0) {
      requestTokenInfo(tokenInfoToRequests.current);
      tokenInfoToRequests.current = [];
    }
  }, 2_000);

  const getTokenInfo = useCallback(
    (tokenMint: string) => {
      // useDeriveInOut was calling with token symbol
      if (!isAddress(tokenMint)) return undefined;

      const found = tokenMap.current.get(tokenMint) || unknownTokenMap.current.get(tokenMint);
      if (!found) tokenInfoToRequests.current.push(tokenMint);

      // prevent banned token
      if (found && checkIsBannedToken(found)) return undefined;
      return found;
    },
    [tokenMap],
  );

  const addOnchainTokenInfo = useCallback((tokenInfo: TokenInfo) => {
    unknownTokenMap.current.set(tokenInfo.address, tokenInfo);
    onChainTokenMap.current.set(tokenInfo.address, tokenInfo);
  }, []);

  return (
    <TokenContext.Provider
      value={{
        tokenMap: tokenMap.current,
        unknownTokenMap: unknownTokenMap.current,
        isLoaded,
        getTokenInfo,
        addOnchainTokenInfo,
        typesenseInstantsearchAdapter,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('TokenContext not found');
  }

  return context;
}
