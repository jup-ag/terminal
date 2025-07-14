import React, { createRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps, areEqual } from 'react-window';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import SearchIcon from 'src/icons/SearchIcon';
import debounce from 'lodash.debounce';
import FormPairRow from './FormPairRow';
import { cn } from 'src/misc/cn';
import { useBalances } from 'src/hooks/useBalances';
import { useSearch } from 'src/hooks/useSearch';
import { Asset } from 'src/entity/SearchResponse';
import { sortByUserBalance } from 'src/misc/utils';

export const PAIR_ROW_HEIGHT = 72;
const SEARCH_BOX_HEIGHT = 56;

// eslint-disable-next-line react/display-name
const rowRenderer = memo((props: ListChildComponentProps) => {
  const { data, index, style } = props;
  const item = data.searchResult[index];
  return <FormPairRow key={item.address} item={item} style={style} onSubmit={data.onSubmit} />;
}, areEqual);

interface IFormPairSelector {
  onSubmit: (value: Asset) => void;
  onClose: () => void;
}
const FormPairSelector = ({ onSubmit, onClose }: IFormPairSelector) => {
  const [search, setSearch] = useState<string>('');
  const { data: balances } = useBalances();
  useEffect(() => {
    if (balances) {
      setSearch(Object.keys(balances).join(','));
    }
  }, [balances]);

  const { data: blueChipTokens } = useSearch([]);
  const { data: searchTokens, isLoading } = useSearch([search]);

  const searchResult = useMemo(() => {
    if (!search) {
      return sortByUserBalance([...(blueChipTokens || []), ...(searchTokens || [])], balances || {});
    } else {
      return sortByUserBalance(searchTokens || [], balances || {});
    }
  }, [blueChipTokens, balances, searchTokens, search]);

  // Update triggerSearch to use cached user balance tokens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSearch = useCallback(
    debounce(async (value: string) => {
      setSearch(value);
    }, 200),
    [blueChipTokens],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch('');
      triggerSearch(e.target.value);
    },
    [triggerSearch],
  );

  const listRef = createRef<FixedSizeList>();
  const inputRef = createRef<HTMLInputElement>();
  useEffect(() => inputRef.current?.focus(), [inputRef]);

  return (
    <div className="flex flex-col h-full w-full py-4 px-2 bg-black">
      <div className="flex w-full justify-between">
        <div className="text-primary-text fill-current w-6 h-6 cursor-pointer" onClick={onClose}>
          <LeftArrowIcon width={24} height={24} />
        </div>

        <div className="text-primary-text">Select Token</div>

        <div className=" w-6 h-6" />
      </div>

      <div
        className="flex px-5 mt-4 w-[98%] rounded-xl bg-module"
        style={{ height: SEARCH_BOX_HEIGHT, maxHeight: SEARCH_BOX_HEIGHT }}
      >
        <SearchIcon />

        <input
          autoComplete="off"
          className="w-full rounded-xl ml-4 truncate bg-transparent text-primary-text placeholder:text-primary-text/50"
          placeholder={`Search`}
          onChange={(e) => onChange(e)}
          ref={inputRef}
        />
      </div>

      <div className="mt-2" style={{ flexGrow: 1 }}>
        {searchResult && searchResult.length > 0 && (
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
          <div className="mt-4 mb-4 text-center text-primary-text/50">
            <span>Loading...</span>
          </div>
        ) : searchResult && searchResult.length === 0 ? (
          <div className="mt-4 mb-4 text-center text-primary-text/50">
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
