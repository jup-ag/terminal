import { MouseEvent, useCallback, useEffect, useMemo } from 'react';
import { NumberFormatValues, NumericFormat } from 'react-number-format';

import { MAX_INPUT_LIMIT, MINIMUM_SOL_BALANCE } from '../misc/constants';

import CoinBalance from './Coinbalance';
import JupButton from './JupButton';

import TokenIcon from './TokenIcon';

import { useSwapContext } from 'src/contexts/SwapContext';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import WalletIcon from 'src/icons/WalletIcon';
import { detectedSeparator } from 'src/misc/utils';
import { WRAPPED_SOL_MINT } from '../constants';
import { CoinBalanceUSD } from './CoinBalanceUSD';
import PriceInfo from './PriceInfo/index';
import SwitchPairButton from './SwitchPairButton';
import Decimal from 'decimal.js';
import { cn } from 'src/misc/cn';
import { SwapMode } from 'src/types/constants';
import JupShield from './JupShield';
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useBalances } from 'src/hooks/useBalances';
import { Asset } from 'src/entity/SearchResponse';
import { useUltraSwapMutation } from 'src/queries/useUltraSwapMutation';
import { SubmitButton } from './SubmitButton';

const FormInputContainer: React.FC<{
  tokenInfo?: Asset;
  onBalanceClick?: (e: React.MouseEvent<HTMLElement>) => void;
  title: string;
  pairSelectDisabled: boolean;
  onClickSelectPair: () => void;
  value: string;
  children: React.ReactNode;
}> = ({ tokenInfo, onBalanceClick, title, pairSelectDisabled, onClickSelectPair, children, value }) => {
  return (
    <div
      className={cn(
        'border border-transparent bg-module rounded-xl transition-all',
        'py-3 px-4 flex flex-col dark:text-primary-text  gap-y-2',
        'group focus-within:border-primary/50 focus-within:shadow-swap-input-dark rounded-xl',
      )}
    >
      <div className="flex justify-between items-center text-xs text-primary-text">
        <div>{title}</div>
        {tokenInfo && (
          <div
            className={cn('flex  space-x-1 text-xs items-center text-primary-text/50 fill-current ', {
              'cursor-pointer': onBalanceClick,
            })}
            onClick={(e) => {
              onBalanceClick?.(e);
            }}
          >
            <WalletIcon width={10} height={10} />
            <CoinBalance mintAddress={tokenInfo.id} hideZeroBalance={false} />
            <span>{tokenInfo.symbol}</span>
          </div>
        )}
      </div>
      <div className="flex">
        <div>
          <button
            type="button"
            className={cn('py-2 px-3 rounded-lg flex items-center bg-interactive text-primary-text', {
              'hover:bg-interactive/80': !pairSelectDisabled,
            })}
            disabled={pairSelectDisabled}
            onClick={onClickSelectPair}
          >
            <div className="h-5 w-5">
              <TokenIcon info={tokenInfo} width={20} height={20} />
            </div>
            <div className="ml-4 mr-2 font-semibold" translate="no">
              <div className="truncate">{tokenInfo?.symbol}</div>
            </div>
            {pairSelectDisabled ? null : (
              <span className="text-primary-text/25 fill-current">
                <ChevronDownIcon />
              </span>
            )}
          </button>

          <div className="flex justify-between items-center h-[20px]">
            {tokenInfo?.id && <JupShield tokenAddress={tokenInfo.id} />}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between w-full">
          {children}
          <span className="text-xs text-primary-text/50">

            {tokenInfo && <CoinBalanceUSD tokenInfo={tokenInfo} amount={value} />}
          </span>
        </div>
      </div>
    </div>
  );
};

const Form: React.FC<{
  isDisabled: boolean;
  setSelectPairSelector: React.Dispatch<React.SetStateAction<'fromMint' | 'toMint' | null>>;
}> = ({  setSelectPairSelector }) => {
  const { publicKey, wallet } = useWalletPassThrough();

  const { data: balances } = useBalances();
  const {
    form,
    setForm,
    fromTokenInfo,
    toTokenInfo,
    quoteResponseMeta,
    formProps: { fixedAmount, swapMode, fixedMint },
    loading,
    isToPairFocused,
    setTxStatus,
    setLastSwapResult,
  } = useSwapContext();
  const { setScreen } = useScreenState();
  const { mutateAsync: ultraSwapMutation } = useUltraSwapMutation();

  const onSubmit = useCallback(async () => {
    if (!wallet || !wallet.adapter.publicKey || !quoteResponseMeta) {
      return null;
    }

    try {
      if (!fromTokenInfo) throw new Error('Missing fromTokenInfo');
      if (!toTokenInfo) throw new Error('Missing toTokenInfo');
      await ultraSwapMutation({
        quoteResponseMeta,
        fromTokenInfo,
        toTokenInfo,
        setTxStatus,
        setLastSwapResult,
      });
    } catch (error) {
      console.log('Swap error', error);
    } finally{
      setScreen('Swapping');
    }
  }, [wallet, quoteResponseMeta, ultraSwapMutation, fromTokenInfo, toTokenInfo, setTxStatus, setLastSwapResult,setScreen]);


  const shouldDisabledFromSelector = useMemo(() => {
    if (fromTokenInfo?.id === fixedMint) {
      return true;
    }
    return false;
  }, [fixedMint, fromTokenInfo?.id]);

  const shouldDisabledToSelector = useMemo(() => {
    if (toTokenInfo?.id === fixedMint) {
      return true;
    }
    return false;
  }, [fixedMint, toTokenInfo?.id]);

  const walletPublicKey = useMemo(() => publicKey?.toString(), [publicKey]);

  const onChangeFromValue = ({ value }: NumberFormatValues) => {
    if (value === '') {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, fromValue: value }));
  };

  const onChangeToValue = ({ value }: NumberFormatValues) => {
    if (value === '') {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, toValue: value }));
  };

  const balance: string | null = useMemo(() => {
    if (!fromTokenInfo?.id) return null;

    if (!balances) return null;
    const accBalanceObj = balances[fromTokenInfo.id];
    if (!accBalanceObj) return null;

    return accBalanceObj.uiAmount.toString();
  }, [balances, fromTokenInfo?.id]);

  const onClickMax = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      if (!balance) return;
      if (fromTokenInfo?.id === WRAPPED_SOL_MINT.toBase58()) {
        setForm((prev) => ({
          ...prev,
          fromValue: new Decimal(balance).gt(MINIMUM_SOL_BALANCE)
            ? new Decimal(balance).minus(MINIMUM_SOL_BALANCE).toFixed(9)
            : '0',
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          fromValue: balance,
        }));
      }
    },
    [balance, fromTokenInfo?.id, setForm],
  );

  const onClickSwitchPair = () => {
    setForm((prev) => ({
      ...prev,
      fromValue: '',
      toValue: '',
      fromMint: prev.toMint,
      toMint: prev.fromMint,
    }));
  };

  const { inputAmountDisabled, outputAmountDisabled } = useMemo(() => {
    const result = { inputAmountDisabled: true, outputAmountDisabled: true };
    if (!fixedAmount) {
      if (swapMode === SwapMode.ExactIn) {
        result.inputAmountDisabled = false;
      } else if (swapMode === SwapMode.ExactOut) {
        result.outputAmountDisabled = false;
      } else {
        result.inputAmountDisabled = false;
        result.outputAmountDisabled = false;
      }
    }
    return result;
  }, [fixedAmount, swapMode]);

  const onClickSelectFromMint = useCallback(() => {
    if (shouldDisabledFromSelector) return;
    setSelectPairSelector('fromMint');
  }, [shouldDisabledFromSelector, setSelectPairSelector]);

  const onClickSelectToMint = useCallback(() => {
    if (shouldDisabledToSelector) return;
    setSelectPairSelector('toMint');
  }, [shouldDisabledToSelector, setSelectPairSelector]);

  const thousandSeparator = useMemo(() => (detectedSeparator === ',' ? '.' : ','), []);
  // Allow empty input, and input lower than max limit
  const withValueLimit = useCallback(
    ({ floatValue }: NumberFormatValues) => !floatValue || floatValue <= MAX_INPUT_LIMIT,
    [],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (window.Jupiter.enableWalletPassthrough && window.Jupiter.onRequestConnectWallet) {
        window.Jupiter.onRequestConnectWallet();
      } else {
        setScreen('Wallet');
      }
    },
    [setScreen],
  );

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full mt-2 rounded-xl flex flex-col px-2">
        <div className="flex-col">
          <FormInputContainer
            tokenInfo={fromTokenInfo!}
            onBalanceClick={(e) => {
              isToPairFocused.current = false;
              onClickMax(e);
            }}
            title="Selling"
            pairSelectDisabled={shouldDisabledFromSelector}
            onClickSelectPair={onClickSelectFromMint}
            value={form.fromValue}
          >
            {fromTokenInfo?.decimals && (
              <NumericFormat
                disabled={fixedAmount || swapMode === SwapMode.ExactOut}
                value={typeof form.fromValue === 'undefined' ? '' : form.fromValue}
                decimalScale={fromTokenInfo.decimals}
                thousandSeparator={thousandSeparator}
                allowNegative={false}
                valueIsNumericString
                inputMode="decimal"
                onValueChange={onChangeFromValue}
                placeholder={'0.00'}
                className={cn(
                  'w-full h-[40px] bg-transparent text-primary-text text-right font-semibold text-xl placeholder:text-primary-text/50',
                  {
                    'cursor-not-allowed': inputAmountDisabled || swapMode === SwapMode.ExactOut,
                  },
                )}
                onKeyDown={() => {
                  isToPairFocused.current = false;
                }}
                decimalSeparator={detectedSeparator}
                isAllowed={withValueLimit}
              />
            )}
          </FormInputContainer>
          <div className="relative z-10 -my-3 flex justify-center">
            <SwitchPairButton onClick={onClickSwitchPair} className={cn('transition-all')} />
          </div>
          <FormInputContainer
            tokenInfo={toTokenInfo!}
            title="Buying"
            pairSelectDisabled={shouldDisabledToSelector}
            onClickSelectPair={onClickSelectToMint}
            value={form.toValue}
          >
            {toTokenInfo?.decimals && (
              <NumericFormat
                inputMode="decimal"
                disabled={outputAmountDisabled || swapMode === SwapMode.ExactIn}
                value={typeof form.toValue === 'undefined' ? '' : form.toValue}
                decimalScale={toTokenInfo.decimals}
                thousandSeparator={thousandSeparator}
                allowNegative={false}
                valueIsNumericString
                onValueChange={onChangeToValue}
                className={cn(
                  'h-[40px] w-full bg-transparent text-primary-text text-right font-semibold text-lg placeholder:text-primary-text/50',
                  {
                    'cursor-not-allowed': outputAmountDisabled || swapMode === SwapMode.ExactIn,
                  },
                )}
                placeholder={swapMode === SwapMode.ExactOut ? 'Enter desired amount' : '0.00'}
                decimalSeparator={detectedSeparator}
                isAllowed={withValueLimit}
                onKeyDown={(e) => {
                  if (
                    e.metaKey ||
                    e.ctrlKey ||
                    e.key === 'Meta' ||
                    e.key === 'Control' ||
                    e.key === 'Alt' ||
                    e.key === 'Shift'
                  ) {
                    return;
                  }
                  isToPairFocused.current = true;
                }}
              />
            )}
          </FormInputContainer>
        </div>
      </div>

      <div className="w-full px-2">
        {!walletPublicKey ? (
          <JupButton size="lg" className="w-full mt-4 bg-primary !text-uiv2-text/75" onClick={handleClick}>
            Connect Wallet
          </JupButton>
        ) : (
          <SubmitButton onSubmit={onSubmit} />
        )}

        {quoteResponseMeta && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            quoteResponse={quoteResponseMeta}
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
