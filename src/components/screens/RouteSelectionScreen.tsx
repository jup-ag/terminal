import React, { memo, useMemo, useRef } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';
import LeftArrowIcon from 'src/icons/LeftArrowIcon';

import { VariableSizeList as List } from 'react-window';
import { areEqual, ListChildComponentProps } from 'react-window';
import classNames from 'classnames';
import { RouteInfo } from '@jup-ag/react-hook';
import { useTokenContext } from 'src/contexts/TokenContextProvider';
import { TokenInfo } from '@solana/spl-token-registry';
import { fromLamports } from 'src/misc/utils';

export const ROUTE_HEIGHT = 64;
export const PADDING_TOP = 18;

// eslint-disable-next-line react/display-name
const rowRenderer = memo((props: ListChildComponentProps) => {
  const { data, index, style } = props;
  const item = data.availableRoutes[index] as RouteInfo;
  const fromTokenInfo = data.fromTokenInfo as TokenInfo;
  const toTokenInfo = data.toTokenInfo as TokenInfo;

  const active = data.selectedSwapRoute == data.availableRoutes[index];
  const marketRoutes = item ? item.marketInfos.map(({ label }) => label).join(', ') : '';
  const className = active ? 'bg-jupiter-swap-gradient' : '';
  const onSubmit = () => data.onSubmit(item);

  return (
    <li
      className={`cursor-pointer list-none text-xs flex rounded-xl ${className}`}
      style={{ maxHeight: ROUTE_HEIGHT, height: ROUTE_HEIGHT, ...style, top: Number(style.top) + 18 }}
      translate="no"
    >
      {index === 0 && (
        <div
          className={`absolute px-2 py-1 font-semibold text-white p-0.5 bg-[#FBA43A]`}
          style={{ borderRadius: 4, left: 0, top: -14, fontSize: 11 }}
        >
          <span>Best price</span>
        </div>
      )}

      <div
        className={`flex items-center w-full justify-between rounded-xl space-x-4 m-0.5 p-4 bg-[#2C2D33] ${
          active ? '' : 'hover:bg-black/10'
        } `}
        onClick={onSubmit}
      >
        <div className="text-white/50 w-[50%]">{marketRoutes}</div>

        <div className="w-[50%] text-right">
          <p className="text-sm font-semibold text-white truncate">
            {data.swapMode === 'ExactOut' ? 
            `${fromLamports(item.inAmount, fromTokenInfo.decimals || 6)} ${fromTokenInfo.symbol}`
            : `${fromLamports(item.outAmount, toTokenInfo.decimals || 6)} ${toTokenInfo.symbol}`}
          </p>
        </div>
      </div>
    </li>
  );
}, areEqual);

const RouteSelectionScreen: React.FC<{ onClose(): void }> = ({ onClose }) => {
  const {
    form: { fromMint, toMint },
    selectedSwapRoute,
    setSelectedSwapRoute,
    swapMode,
    jupiter: { routes },
  } = useSwapContext();

  const onGoBack = () => {
    onClose();
  };
  const onSubmit = (route: RouteInfo) => {
    setSelectedSwapRoute(route);
  };

  const { tokenMap } = useTokenContext();
  const [fromTokenInfo, toTokenInfo] = useMemo(() => {
    return [
      fromMint ? tokenMap.get(fromMint) : null,
      toMint ? tokenMap.get(toMint) : null,
    ]
  }, [fromMint, toMint, tokenMap]);

  const listRef = useRef<any>();
  const availableRoutes = useMemo(() => routes || [], [routes]);

  return (
    <div className="flex flex-col h-full w-full py-4 px-2">
      <div className="flex w-full justify-between">
        <div className="text-white fill-current w-6 h-6 cursor-pointer" onClick={onGoBack}>
          <LeftArrowIcon width={24} height={24} />
        </div>

        <div className="text-white">Select Route</div>

        <div className=" w-6 h-6" />
      </div>

      <p className="text-xs text-white/50 my-3">
        Jupiter automatically selects a route with the best price, however you can select a route manually.
      </p>

      <div className="mt-2 overflow-y-auto overflow-x-hidden webkit-scrollbar" style={{ flexGrow: 1 }}>
        {(availableRoutes || []).length > 0 ? (
          <List
            ref={listRef}
            height={availableRoutes.length * ROUTE_HEIGHT + PADDING_TOP}
            itemCount={availableRoutes.length}
            itemSize={() => ROUTE_HEIGHT}
            width={'100%'}
            itemData={{
              availableRoutes,
              fromTokenInfo,
              toTokenInfo,
              selectedSwapRoute,
              onSubmit,
              swapMode,
            }}
            className={classNames('overflow-y-scroll mr-1 min-h-[12rem] webkit-scrollbar pt-4')}
          >
            {rowRenderer}
          </List>
        ) : null}
      </div>
    </div>
  );
};

export default RouteSelectionScreen;
