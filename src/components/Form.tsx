import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NumberFormatValues, NumericFormat } from 'react-number-format';

import { useAccounts } from '../contexts/accounts';

import { MAX_INPUT_LIMIT, MINIMUM_SOL_BALANCE } from '../misc/constants';

import CoinBalance from './Coinbalance';
import FormError from './FormError';

import TokenIcon from './TokenIcon';

import { WRAPPED_SOL_MINT } from '../constants';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import WalletIcon from 'src/icons/WalletIcon';
import classNames from 'classnames';
import { detectedSeparator, formatNumber } from 'src/misc/utils';
import CoinBalanceUSD from './CoinBalanceUSD';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import JupButton from './JupButton';
import SexyChameleonText from './SexyChameleonText/SexyChameleonText';
import useJupiterSwapPriceFetcher from 'src/hooks/useJupiterSwapPriceFetcher';
import Decimal from 'decimal.js';
import { ILockingPlan, LOCKING_PLAN, useSwapContext } from 'src/contexts/SwapContext';
import { setupDCA } from 'src/dca';



const Form: React.FC<{
  onSubmit: () => void;
  isDisabled: boolean;
  setSelectPairSelector: React.Dispatch<React.SetStateAction<'fromMint' | 'toMint' | null>>;
  setIsWalletModalOpen(toggle: boolean): void;
}> = ({ onSubmit, isDisabled, setSelectPairSelector, setIsWalletModalOpen }) => {
  const { connect, wallet } = useWalletPassThrough();
  const { accounts } = useAccounts();

  const {
    form,
    setForm,
    errors,
    fromTokenInfo,
    toTokenInfo,
    dca: { program, dcaClient, provider },
  } = useSwapContext();

  const loading = false;

  const onConnectWallet = () => {
    if (wallet) connect();
    else {
      setIsWalletModalOpen(true);
    }
  };

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const onChangeFromValue = (value: string) => {
    if (value === '') {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, fromValue: value }));
  };

  const onChangeToValue = (value: string) => {
    if (value === '') {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, toValue: value }));
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
          fromValue: String(balance > MINIMUM_SOL_BALANCE ? (balance - MINIMUM_SOL_BALANCE).toFixed(6) : 0),
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

  const onClickSelectFromMint = useCallback(() => {
    setSelectPairSelector('fromMint');
  }, []);

  const onClickSelectToMint = useCallback(() => {
    setSelectPairSelector('toMint');
  }, []);

  const thousandSeparator = useMemo(() => (detectedSeparator === ',' ? '.' : ','), []);
  // Allow empty input, and input lower than max limit
  const withValueLimit = useCallback(
    ({ floatValue }: NumberFormatValues) => !floatValue || floatValue <= MAX_INPUT_LIMIT,
    [],
  );

  const lastRefreshTimestampSwapPrice = useRef<number>(0);
  const { fetchPrice } = useJupiterSwapPriceFetcher();
  const [selectedPlan, setSelectedPlan] = useState<ILockingPlan['name']>('5 minutes');
  const [swapMarketPrice, setSwapMarketPrice] = useState<Decimal | undefined>(undefined);
  const refreshSwapMarketPrice = useCallback(async () => {
    if (!fromTokenInfo || !toTokenInfo) return;

    try {
      const params = {
        fromTokenInfo,
        toTokenInfo,
        // guesstimate 1 USD
        amount: new Decimal(1).mul(10 ** fromTokenInfo.decimals).toFixed(0),
      };

      const result = await fetchPrice(params);
      setSwapMarketPrice(new Decimal(1).div(result));
    } catch (error) {
      console.error(error);
    } finally {
      lastRefreshTimestampSwapPrice.current = Date.now();
    }
  }, [fetchPrice, fromTokenInfo, toTokenInfo]);

  useEffect(() => {
    refreshSwapMarketPrice();
  }, [fromTokenInfo]);

  return (
    <div className="h-full flex flex-col items-center pb-4">
      <div className="w-full mt-2 rounded-xl flex flex-col px-2">
        <div className="flex-col">
          <div className={classNames('border-b border-transparent bg-[#212128] rounded-xl transition-all')}>
            <div className={classNames('px-x border-transparent rounded-xl ')}>
              <div>
                <div className={classNames('py-5 px-4 flex flex-col dark:text-white')}>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 rounded-2xl flex items-center bg-[#36373E] hover:bg-white/20 text-white"
                      onClick={onClickSelectFromMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon tokenInfo={fromTokenInfo} width={20} height={20} />
                      </div>
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {fromTokenInfo?.symbol}
                      </div>
                      <span className="text-white/25 fill-current">
                        <ChevronDownIcon />
                      </span>
                    </button>

                    <div className="text-right">
                      <NumericFormat
                        value={typeof form.fromValue === 'undefined' ? '' : form.fromValue}
                        decimalScale={fromTokenInfo?.decimals}
                        thousandSeparator={thousandSeparator}
                        allowNegative={false}
                        valueIsNumericString
                        onValueChange={({ value }) => onChangeFromValue(value)}
                        placeholder={'0.00'}
                        className={classNames(
                          'h-full w-full bg-transparent text-white text-right font-semibold dark:placeholder:text-white/25 text-lg',
                        )}
                        decimalSeparator={detectedSeparator}
                        isAllowed={withValueLimit}
                      />
                    </div>
                  </div>

                  {fromTokenInfo?.address ? (
                    <div className="flex justify-between items-center">
                      <div
                        className={classNames(
                          'flex mt-3 space-x-1 text-xs items-center text-white/30 fill-current cursor-pointer',
                        )}
                        onClick={onClickMax}
                      >
                        <WalletIcon width={10} height={10} />
                        <CoinBalance mintAddress={fromTokenInfo.address} />
                        <span>{fromTokenInfo.symbol}</span>
                      </div>

                      {form.fromValue ? (
                        <span className="text-xs text-white/30">
                          <CoinBalanceUSD tokenInfo={fromTokenInfo} amount={form.fromValue} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className={'my-4'} />

          <div className="border-b border-transparent flex space-x-2">
            {LOCKING_PLAN.map((item) => {
              return (
                <div
                  key={item.name}
                  onClick={() => setSelectedPlan(item.name)}
                  className={classNames(
                    'w-full p-3 flex flex-col items-center justify-center space-y-2 bg-[#212128] rounded-xl cursor-pointer',
                    selectedPlan === item.name ? 'border border-jupiter-jungle-green' : 'border border-transparent',
                  )}
                >
                  <span className="text-white font-semibold">{item.name}</span>
                  <span className="text-white/50 text-xs font-semibold">{`Bonus: ${item.incetivesPct}%`}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full px-2 text-xs text-white/50 flex items-center justify-between h-4 mt-2">
            {fromTokenInfo && toTokenInfo && swapMarketPrice ? (
              <div className="flex w-full justify-between">
                <span>Market Rate:</span>
                <span>
                  1 {fromTokenInfo.symbol} ≈{' '}
                  {formatNumber.format(swapMarketPrice?.toDP(toTokenInfo.decimals).toNumber() || 0)}{' '}
                  {toTokenInfo.symbol}
                </span>
              </div>
            ) : (
              'Getting market price...'
            )}
          </div>

          <div className="w-full px-2">
            {!walletPublicKey ? (
              <JupButton size="lg" className="w-full mt-4" type="button" onClick={onConnectWallet}>
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
                {loading ? <span className="text-sm">Loading...</span> : <SexyChameleonText>Lock</SexyChameleonText>}
              </JupButton>
            )}
          </div>
        </div>

        {walletPublicKey ? <FormError errors={errors} /> : null}
      </div>
    </div>
  );
};

export default Form;
