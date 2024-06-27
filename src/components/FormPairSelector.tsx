import { TokenInfo } from '@solana/spl-token-registry';
import classNames from 'classnames';
import React, { createRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InstantSearch, useInstantSearch, useSearchBox } from 'react-instantsearch';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps, areEqual } from 'react-window';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import SearchIcon from 'src/icons/SearchIcon';


import { useConnection } from '@jup-ag/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import debounce from 'lodash.debounce';
import { useTokenContext } from 'src/contexts/TokenContextProvider';
import { useUSDValueProvider } from 'src/contexts/USDValueProvider';
import { searchOnChainTokens } from 'src/contexts/searchOnChains';
import { checkIsBannedToken, checkIsUnknownToken } from 'src/misc/tokenTags';
import FormPairRow from './FormPairRow';
import { useSortByValue } from './useSortByValue';

export const PAIR_ROW_HEIGHT = 72;
const SEARCH_BOX_HEIGHT = 56;

// eslint-disable-next-line react/display-name
const rowRenderer = memo((props: ListChildComponentProps) => {
  const { data, index, style } = props;
  const item = data.searchResult[index];

  return <FormPairRow key={item.address} item={item} style={style} onSubmit={data.onSubmit} usdValue={data.mintToUsdValue.get(item.address)} />;
}, areEqual);

const generateSearchTerm = (info: TokenInfo, searchValue: string) => {
  const isMatchingWithSymbol = info.symbol.toLowerCase().indexOf(searchValue) >= 0;
  const matchingSymbolPercent = isMatchingWithSymbol ? searchValue.length / info.symbol.length : 0;
  const isUnknown = checkIsUnknownToken(info);
  const matchingTerm = `${info.symbol} ${info.name}`.toLowerCase();

  return {
    token: info,
    matchingIdx: matchingTerm.indexOf(searchValue),
    matchingSymbolPercent,
    isUnknown,
  };
};

const startSearch = async (items: TokenInfo[], searchValue: string): Promise<TokenInfo[]> => {
  const normalizedSearchValue = searchValue.toLowerCase();

  const searchTermResults = items.reduce(
    (acc, item) => {
      const result = generateSearchTerm(item, normalizedSearchValue);
      if (result.matchingIdx >= 0) {
        acc.push(result);
      }
      return acc;
    },
    [] as Array<ReturnType<typeof generateSearchTerm>>,
  );

  return searchTermResults
    .sort((i1, i2) => {
      const matchingIndex = i1.matchingIdx - i2.matchingIdx;
      const matchingSymbol =
        i2.matchingSymbolPercent > i1.matchingSymbolPercent
          ? 1
          : i2.matchingSymbolPercent == i1.matchingSymbolPercent && i1.isUnknown && !i2.isUnknown // unknown tokens should be at the bottom
          ? 0
          : -1;
      return matchingIndex >= 0 ? matchingSymbol : matchingIndex;
    })
    .map((item) => item.token);
};

interface IFormPairSelector {
  onSubmit: (value: TokenInfo) => void;
  onClose: () => void;
  tokenInfos: TokenInfo[];
}
const FormPairSelector = ({ onSubmit, tokenInfos, onClose }: IFormPairSelector) => {
  const { tokenMap, unknownTokenMap, addOnchainTokenInfo } = useTokenContext();
  const { getUSDValue } = useUSDValueProvider();
  const { connection } = useConnection();

  const {
    setUiState,
    results: typesenseResults,
    error: typesenseError,
    status: typesenseStatus,
  } = useInstantSearch({ catchError: true });
  const { refine, clear, isSearchStalled } = useSearchBox();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSearch = useCallback(
    debounce((value: string) => {
      if (value.length > 2) {
        refine(value);
      } else {
        clear();
      }
    }, 200),
    [],
  );

  const searchValue = useRef<string>('');
  const [triggerLocalSearch, setTriggerLocalSearch] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const haveSearchedOnchain = useRef(false);
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchResult([]);
      setIsSearching(true);
      setTriggerLocalSearch(e.target.value);
      const value = e.target.value;
      searchValue.current = value;
      triggerSearch(value);

      if (searchValue.current.length >= 32 && searchValue.current.length <= 48) {
        haveSearchedOnchain.current = false;
      }
    },
    [triggerSearch],
  );

  const tokenInfoArray = useMemo(() => {
    return [...tokenMap.values(), ...unknownTokenMap.values()];
  }, [tokenMap, unknownTokenMap]);

  const userWalletResults = useMemo(() => {
    const userWalletResults: TokenInfo[] = [...tokenMap.values(), ...unknownTokenMap.values()];
    return userWalletResults;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchResult, setSearchResult] = useState<TokenInfo[]>(tokenInfos);
  const { sortTokenListByBalance, filterStrictToken, mintToUsdValue } = useSortByValue();

  // Multi-tiered search
  // 1. Search pre-bundled token list (if /all-tokens is available, will supersede this)
  // 2. Search typesense
  // 3. Wait for /all-tokens to load, and search
  // 4. TODO: support on chain search
  useEffect(() => {
    (async () => {
      // Show user wallet tokens by default
      if (!searchValue.current) {
        setSearchResult(await sortTokenListByBalance(userWalletResults));
        setIsSearching(false);
        return;
      }

      const newMap = new Map<string, TokenInfo>();
      const isValidPublickey = (() => {
        try {
          return Boolean(new PublicKey(searchValue.current));
        } catch (error) {
          return false;
        }
      })();

      // Step 0: Check if token is already cached
      const foundOnStrict = tokenMap.get(searchValue.current);
      if (foundOnStrict) {
        setSearchResult([foundOnStrict]);
        setIsSearching(false);
        return;
      }

      // Step 1 or 3
      if (searchValue.current) {
        const result = await startSearch(tokenInfoArray, searchValue.current);
        result.forEach((item) => newMap.set(item.address, item));
      }

      // Step 2
      // Typesense tends to keep the last result, by checking `searchValue === typesenseResults.query` we can prevent this
      if (
        searchValue.current === typesenseResults.query &&
        searchValue.current.length > 2 &&
        typesenseResults &&
        !typesenseError
      ) {
        const hits = typesenseResults.hits as any as TokenInfo[];
        hits.forEach((item) => newMap.set(item.address, item));

        // Populate all typesense results into unknownTokenMap
        hits.forEach((item) => {
          if (tokenMap.has(item.address) || unknownTokenMap.has(item.address)) return;
          unknownTokenMap.set(item.address, item);
        });
      }

      // Step 4, check if there's direct match, prevent imposer token with mint as name
      // e.g 8ULCkCTUa3XXrNXaDVzPcja2tdJtRdxRr8T4eZjVKqk
      if (isValidPublickey) {
        const hasDirectResult = newMap.get(searchValue.current);
        if (hasDirectResult) {
          setSearchResult([hasDirectResult]);
        }
      } else {
        const filtered = Array.from(newMap.values()).filter((item) => !checkIsBannedToken(item));
        setSearchResult(await sortTokenListByBalance(filtered));
      }

      // Step 5, If no typesense hits, perform onchain search
      // should wait until there's no result, then start searching
      const foundOnTypesense = Boolean(
        isValidPublickey && typesenseResults.hits.find((item) => item.address === searchValue.current),
      );
      if (isValidPublickey && foundOnTypesense === false) {
        const tokenInfoOnchain = await searchOnChainTokens(connection, [searchValue.current]);
        const onChainResult = tokenInfoOnchain.get(searchValue.current);
        if (onChainResult) {
          setSearchResult((prev) => {
            const newMap = new Map<string, TokenInfo>();
            newMap.set(onChainResult.address, onChainResult);
            prev.forEach((item) => newMap.set(item.address, item));
            return Array.from(newMap.values());
          });
          addOnchainTokenInfo(onChainResult);
        }
        haveSearchedOnchain.current = true;
      }

      setIsSearching(false);
    })();
  }, [
    typesenseResults,
    searchValue,
    sortTokenListByBalance,
    filterStrictToken,
    typesenseError,
    tokenInfoArray,
    tokenMap,
    getUSDValue,
    unknownTokenMap,
    triggerLocalSearch,
    connection,
    addOnchainTokenInfo,
    userWalletResults,
  ]);

  const listRef = createRef<FixedSizeList>();
  const inputRef = createRef<HTMLInputElement>();
  useEffect(() => inputRef.current?.focus(), [inputRef]);

  return (
    <div className="flex flex-col h-full w-full py-4 px-2 bg-v3-modal">
      <div className="flex w-full justify-between">
        <div className="text-white fill-current w-6 h-6 cursor-pointer" onClick={onClose}>
          <LeftArrowIcon width={24} height={24} />
        </div>

        <div className="text-white">Select Token</div>

        <div className=" w-6 h-6" />
      </div>

      <div
        className="flex px-5 mt-4 w-[98%] rounded-xl bg-v2-lily/10"
        style={{ height: SEARCH_BOX_HEIGHT, maxHeight: SEARCH_BOX_HEIGHT }}
      >
        <SearchIcon />

        <input
          autoComplete="off"
          className="w-full rounded-xl ml-4 truncate bg-transparent text-white/50 placeholder:text-white/20"
          placeholder={`Search`}
          onChange={(e) => onChange(e)}
          ref={inputRef}
        />
      </div>

      <div className="mt-2" style={{ flexGrow: 1 }}>
        {searchResult.length > 0 && (
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => {
              return (
                <FixedSizeList
                  ref={listRef}
                  height={height}
                  itemCount={searchResult.length}
                  itemSize={PAIR_ROW_HEIGHT}
                  width={width - 2} // -2 for scrollbar
                  itemData={{
                    searchResult,
                    onSubmit,
                    mintToUsdValue,
                  }}
                  className={classNames('overflow-y-scroll mr-1 min-h-[12rem] px-5 webkit-scrollbar')}
                >
                  {rowRenderer}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        )}

        {searchResult.length === 0 ? (
          <div className="mt-4 mb-4 text-center text-white/50">
            <span>No tokens found</span>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

const Comp = (props: IFormPairSelector) => {
  const { typesenseInstantsearchAdapter } = useTokenContext();
  return (
    <InstantSearch
      indexName="tokens"
      searchClient={typesenseInstantsearchAdapter.searchClient}
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      <FormPairSelector {...props} />
    </InstantSearch>
  );
};

export default Comp;
