import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';


import { useAccounts } from '../contexts/accounts';

import { MINIMUM_SOL_BALANCE } from '../misc/constants';

import CoinBalance from './Coinbalance';
import FormError from './FormError';
import JupButton from './JupButton';

import OpenJupiterButton from './OpenJupiterButton';
import SwapRoute from './SwapRoute';
import TokenIcon from './TokenIcon';

import Collapse from './Collapse';
import Tooltip from './Tooltip';
import InfoIcon from '../icons/InfoIcon';
import { WRAPPED_SOL_MINT } from '../constants';
import { useSwapContext } from 'src/contexts/SwapContext';
import useTimeDiff from './useTimeDiff/useTimeDiff';
import SpinnerProgress from './SpinnerProgress/SpinnerProgress';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import classNames from 'classnames';
import WalletIcon from 'src/icons/WalletIcon';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import PriceInfo from './PriceInfo/index';
import { RoutesSVG } from 'src/icons/RoutesSVG';
import SexyChameleonText from './SexyChameleonText/SexyChameleonText';

const Form: React.FC<{
  onSubmit: () => void;
  isDisabled: boolean;
  setSelectPairSelector: React.Dispatch<React.SetStateAction<"fromMint" | "toMint" | null>>;
  setIsWalletModalOpen(toggle: boolean): void
}> = ({
  onSubmit,
  isDisabled,
  setSelectPairSelector,
  setIsWalletModalOpen,
}) => {
  const { connect, wallet } = useWalletPassThrough();
    const { accounts } = useAccounts();
    const {
      form,
      setForm,
      errors,
      fromTokenInfo,
      toTokenInfo,
      outputRoute,
      mode,
      jupiter: {
        routes,
        loading,
        refresh,
      }
    } = useSwapContext();
    const [hasExpired, timeDiff] = useTimeDiff();

    useEffect(() => {
      if (hasExpired) {
        refresh();
      }
    }, [hasExpired])


    const onConnectWallet = () => {
      if (wallet) connect();
      else {
        setIsWalletModalOpen(true);
      }
    };

    const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
      wallet?.adapter.publicKey,
    ]);

    const jupiterDirectLink = useMemo(() => {
      if (fromTokenInfo && toTokenInfo) {
        const inAmount = form.fromValue ? form.fromValue : '1';
        return `https://jup.ag/swap/${fromTokenInfo.address}-${toTokenInfo.address}?inAmount=${inAmount}`;
      }
      return 'https://jup.ag';
    }, [fromTokenInfo, toTokenInfo, form.fromValue]);

    const onChangeFromValue = (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const isInvalid = Number.isNaN(Number(e.target.value));
      if (isInvalid) return;

      setForm((form) => ({ ...form, fromValue: e.target.value }));
    };

    const balance = useMemo(() => {
      return fromTokenInfo ? accounts[fromTokenInfo.address]?.balance || 0 : 0;
    }, [accounts, fromTokenInfo]);

    const onClickMax = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        if (!balance) return;

        if (fromTokenInfo?.address === WRAPPED_SOL_MINT.toBase58()) {
          setForm((prev) => ({
            ...prev,
            fromValue: String(
              balance > MINIMUM_SOL_BALANCE ? balance - MINIMUM_SOL_BALANCE : 0,
            ),
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            fromValue: String(balance),
          }));
        }
      },
      [balance, fromTokenInfo],
    );

    const [shouldDisplay, setShouldDisplay] = useState(false);
    const onToggleExpand = () => {
      if (shouldDisplay) {
        setShouldDisplay(false);
      } else {
        setShouldDisplay(true);
      }
    };

    const marketRoutes = outputRoute ? outputRoute.marketInfos.map(({ amm }) => amm.label).join(', ') : '';
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-full mt-2 rounded-xl flex flex-col px-2">
          <div className="flex-col">
            <div className="border-b border-transparent bg-[#212128] rounded-xl">
              <div className="px-x border-transparent rounded-xl">
                <div>
                  <div className="py-5 px-4 flex flex-col dark:text-white">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        className="py-2 px-3 rounded-2xl flex items-center bg-[#36373E] hover:bg-white/20 text-white"
                        onClick={() => setSelectPairSelector('fromMint')}
                      >
                        <div className='h-5 w-5'>
                          <TokenIcon tokenInfo={fromTokenInfo} width={20} height={20} />
                        </div>
                        <div className="ml-4 mr-2 font-semibold" translate="no">
                          {fromTokenInfo?.symbol}
                        </div>

                        <span className='text-white/25 fill-current'>
                          <ChevronDownIcon />
                        </span>
                      </button>

                      <div className="text-right">
                        <input
                          placeholder="0.00"
                          className="h-full w-full bg-transparent disabled:opacity-100 disabled:text-black text-white text-right font-semibold dark:placeholder:text-white/25 text-2xl "
                          value={form.fromValue}
                          onChange={(e) => onChangeFromValue(e)}
                        />
                      </div>
                    </div>

                    {fromTokenInfo?.address ? (
                      <div
                        className="flex mt-3 cursor-pointer space-x-1 text-xs items-center text-white/30 fill-current"
                        onClick={onClickMax}
                      >
                        <WalletIcon width={10} height={10} />
                        <CoinBalance mintAddress={fromTokenInfo.address} />
                        <span>{fromTokenInfo.symbol}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 border-b border-transparent bg-[#212128] rounded-xl">
              <div className="px-x border-transparent rounded-xl">
                <div>
                  <div className="py-5 px-4 flex flex-col dark:text-white">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        className="py-2 px-3 rounded-2xl flex items-center bg-[#36373E] hover:bg-white/20 disabled:hover:bg-[#36373E] text-white"
                        disabled={mode === 'outputOnly'}
                        onClick={mode === 'default' ? () => setSelectPairSelector('toMint') : () => { }}
                      >
                        <div className='h-5 w-5'>
                          <TokenIcon tokenInfo={toTokenInfo} width={20} height={20} />
                        </div>
                        <div className="ml-4 mr-2 font-semibold" translate="no">
                          {toTokenInfo?.symbol}
                        </div>

                        <span className='text-white/25 fill-current'>
                          <ChevronDownIcon />
                        </span>
                      </button>

                      <div className="text-right">
                        <input
                          className="h-full w-full bg-transparent text-white text-right font-semibold dark:placeholder:text-white/25 text-lg"
                          value={form.toValue}
                          disabled
                        />
                      </div>
                    </div>

                    {toTokenInfo?.address ? (
                      <div
                        className="flex mt-3 space-x-1 text-xs items-center text-white/30 fill-current"
                      >
                        <WalletIcon width={10} height={10} />
                        <CoinBalance mintAddress={toTokenInfo.address} />
                        <span>{toTokenInfo.symbol}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {outputRoute
              ? (
                <div className='flex mt-2 text-xs space-x-1'>
                  <div className='bg-black/20 rounded-xl px-2 py-1'>
                    <RoutesSVG width={7} height={9} />
                  </div>
                  <span className='text-white/30'>using</span>
                  <span className='text-white/50'>{marketRoutes}</span>
                </div>
              ) : null}
          </div>
        </div>

        <div className='w-full px-2'>
          <FormError errors={errors} />

          {!walletPublicKey ? (
            <JupButton
              size="lg"
              className="w-full mt-4"
              type="button"
              onClick={onConnectWallet}
            >
              Connect Wallet
            </JupButton>
          ) : (
            <JupButton
              size="lg"
              className="w-full mt-4 disabled:opacity-50"
              type="button"
              onClick={onSubmit}
              disabled={isDisabled || loading}
            >
              {loading ? 'Loading...' : <SexyChameleonText>Swap</SexyChameleonText>}
            </JupButton>
          )}

          {routes && outputRoute && fromTokenInfo && toTokenInfo ? (
            <PriceInfo
              routes={routes}
              selectedSwapRoute={outputRoute}
              fromTokenInfo={fromTokenInfo}
              toTokenInfo={toTokenInfo}
              loading={loading}
            />
          ) : null}
        </div>
      </div>
    );
  };

export default Form;
