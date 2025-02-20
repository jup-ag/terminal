import { TokenInfo } from '@solana/spl-token-registry';
import React, { createRef, memo, useCallback, useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps, areEqual } from 'react-window';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import SearchIcon from 'src/icons/SearchIcon';

import { useConnection } from '@jup-ag/wallet-adapter';
import debounce from 'lodash.debounce';
import { useTokenContext } from 'src/contexts/TokenContextProvider';
import { useUSDValueProvider } from 'src/contexts/USDValueProvider';
import { checkIsUnknownToken } from 'src/misc/tokenTags';
import FormPairRow from './FormPairRow';
import { useSortByValue } from './useSortByValue';
import { useMutation, useQuery } from '@tanstack/react-query';
import { searchService } from 'src/contexts/SearchService';
import { useAccounts } from 'src/contexts/accounts';
import { cn } from 'src/misc/cn';

export const PAIR_ROW_HEIGHT = 72;
const SEARCH_BOX_HEIGHT = 56;

// eslint-disable-next-line react/display-name
const rowRenderer = memo((props: ListChildComponentProps) => {
  const { data, index, style } = props;
  const item = data.searchResult[index];

  return (
    <FormPairRow
      key={item.address}
      item={item}
      style={style}
      onSubmit={data.onSubmit}
      usdValue={data.mintToUsdValue.get(item.address)}
    />
  );
}, areEqual);

interface IFormPairSelector {
  onSubmit: (value: TokenInfo) => void;
  onClose: () => void;
  tokenInfos: TokenInfo[];
}
const FormPairSelector = ({ onSubmit, tokenInfos, onClose }: IFormPairSelector) => {
  const { tokenMap } = useTokenContext();
  const { mutateAsync: performSearch, isLoading } = useMutation(async (value: string) => {
    const response = await searchService.search(value);
    return response;
  });

  const searchValue = useRef<string>('');

  const { data: blueChipTokens } = useQuery({
    queryKey: ['blueChipTokens'],
    queryFn: () => searchService.search(''),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { accounts: userAccounts, loading: isInitialLoading } = useAccounts();
  const { data: userBalanceTokens } = useQuery({
    queryKey: ['userBalanceTokens', userAccounts],
    queryFn: async () => {
      const userMints = Object.keys(userAccounts).filter((key) => userAccounts[key].balanceLamports.gtn(0));
      return searchService.getUserBalanceTokenInfo(userMints);
    },
    enabled: Object.keys(userAccounts).length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Update triggerSearch to use cached user balance tokens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSearch = useCallback(
    debounce(async (value: string) => {
      try {
        if (!value || value.length < 1) {
          setSearchResult(await sortTokenListByBalance([...(blueChipTokens || []), ...(userBalanceTokens || [])]));
          return;
        }

        const searchResult = await performSearch(value);
        setSearchResult(searchResult);
        searchResult.forEach((item) => tokenMap.set(item.address, item));
      } catch (error) {
        console.error(error);
      }
    }, 200),
    [blueChipTokens, userBalanceTokens], // Add userBalanceTokens to dependencies
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchResult([]);
      triggerSearch(e.target.value);
      searchValue.current = e.target.value;
    },
    [triggerSearch],
  );

  const [searchResult, setSearchResult] = useState<TokenInfo[]>(tokenInfos);
  const { sortTokenListByBalance, mintToUsdValue } = useSortByValue();

  const listRef = createRef<FixedSizeList>();
  const inputRef = createRef<HTMLInputElement>();
  useEffect(() => inputRef.current?.focus(), [inputRef]);

  // Initial call after loading is done, so balances and tokens are sorted properly
  useEffect(() => {
    if (!isInitialLoading) {
      triggerSearch(searchValue.current);
    }
  }, [triggerSearch, isInitialLoading]);

  return (
    <div className="flex flex-col h-full w-full py-4 px-2 bg-black">
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
                  className={cn('overflow-y-scroll mr-1 min-h-[12rem] px-5 webkit-scrollbar')}
                >
                  {rowRenderer}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        )}

        {isLoading ? (
          <div className="mt-4 mb-4 text-center text-white/50">
            <span>Loading...</span>
          </div>
        ) : searchResult.length === 0 ? (
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

export default FormPairSelector;
