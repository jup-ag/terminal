import { TokenInfo } from '@solana/spl-token-registry';
import classNames from 'classnames';
import React, { createRef, memo, useEffect, useMemo, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { areEqual, FixedSizeList, ListChildComponentProps } from 'react-window';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';
import SearchIcon from 'src/icons/SearchIcon';

import { useAccounts } from '../contexts/accounts';
import CloseIcon from '../icons/CloseIcon';

import JupiterLogo from '../icons/JupiterLogo';

import FormPairRow from './FormPairRow';
import JupButton from './JupButton';

export const PAIR_ROW_HEIGHT = 72;
const SEARCH_BOX_HEIGHT = 56;

// eslint-disable-next-line react/display-name
const rowRenderer = memo((props: ListChildComponentProps) => {
  const { data, index, style } = props;
  const item = data.searchResult[index];

  return <FormPairRow key={item.address} item={item} style={style} onSubmit={data.onSubmit} />;
}, areEqual);

const FormPairSelector = ({
  onSubmit,
  tokenInfos,
  onClose,
  setIsWalletModalOpen,
}: {
  onSubmit: (value: TokenInfo) => void;
  onClose: () => void;
  tokenInfos: TokenInfo[];
  setIsWalletModalOpen(toggle: boolean): void;
}) => {
  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);
  const { accounts, loading: accountsLoading } = useAccounts();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<TokenInfo[]>(tokenInfos);
  useEffect(() => {
    const sortedList = tokenInfos.sort((a, b) => {
      if (!accounts[a.address]) return 1;
      if (!accounts[b.address]) return -1;

      return accounts[b.address].balance - accounts[a.address].balance;
    });

    if (searchTerm) {
      const filteredList = sortedList.filter((item) => item.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
      setSearchResult(filteredList);
    } else {
      setSearchResult(sortedList);
    }
  }, [accounts, tokenInfos, searchTerm]);

  const listRef = createRef<FixedSizeList>();

  if (!walletPublicKey) {
    return (
      <div className="flex flex-col h-full w-full py-4 px-2">
        <div className="flex w-full justify-between">
          <div className="text-white fill-current w-6 h-6 cursor-pointer" onClick={onClose}>
            <LeftArrowIcon width={24} height={24} />
          </div>

          <div className="text-white">Select Token</div>

          <div className=" w-6 h-6" />
        </div>

        <div className="w-full mt-24 flex flex-col items-center">
          <JupiterLogo width={48} height={48} />
          <p className="font-semibold text-lg mt-4 mb-6 text-white w-[60%] text-center">
            Connect Your Wallet to Get Started
          </p>
          <JupButton onClick={() => setIsWalletModalOpen(true)}>Connect Wallet</JupButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full py-4 px-2">
      <div className="flex w-full justify-between">
        <div className="text-white fill-current w-6 h-6 cursor-pointer" onClick={onClose}>
          <LeftArrowIcon width={24} height={24} />
        </div>

        <div className="text-white">Select Token</div>

        <div className=" w-6 h-6" />
      </div>

      <div
        className="flex px-5 mt-4 w-[98%] rounded-xl bg-[#212128]"
        style={{ height: SEARCH_BOX_HEIGHT, maxHeight: SEARCH_BOX_HEIGHT }}
      >
        <SearchIcon />

        <input
          autoComplete="off"
          className="w-full rounded-xl ml-4 truncate bg-[#212128] text-white/50 placeholder:text-white/20"
          placeholder={`Search`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
                  }}
                  className={classNames('overflow-y-scroll mr-1 min-h-[12rem] px-5 webkit-scrollbar')}
                >
                  {rowRenderer}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        )}

        {accountsLoading ? (
          <div className="mt-4 mb-4 text-center text-white/50">
            <span>Loading tokens...</span>
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
