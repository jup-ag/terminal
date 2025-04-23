import { MouseEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { NumberFormatValues, NumericFormat } from 'react-number-format';

import { useAccounts } from '../contexts/accounts';

import { MAX_INPUT_LIMIT, MINIMUM_SOL_BALANCE } from '../misc/constants';

import CoinBalance from './Coinbalance';
import FormError from './FormError';
import JupButton from './JupButton';

import TokenIcon from './TokenIcon';

import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import { RoutesSVG } from 'src/icons/RoutesSVG';
import WalletIcon from 'src/icons/WalletIcon';
import { detectedSeparator } from 'src/misc/utils';
import { WRAPPED_SOL_MINT } from '../constants';
import { CoinBalanceUSD } from './CoinBalanceUSD';
import PriceInfo from './PriceInfo/index';
import SwitchPairButton from './SwitchPairButton';
import useTimeDiff from './useTimeDiff/useTimeDiff';
import Decimal from 'decimal.js';
import { useSuggestionTags } from './SuggestionTags/hooks/useSuggestionTags';
import SuggestionTags from './SuggestionTags';
import { cn } from 'src/misc/cn';
import { SwapMode } from 'src/types/constants';

const Form: React.FC<{
  onSubmit: () => void;
  isDisabled: boolean;
  setSelectPairSelector: React.Dispatch<React.SetStateAction<'fromMint' | 'toMint' | null>>;
  setIsWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ onSubmit, isDisabled, setSelectPairSelector, setIsWalletModalOpen }) => {
  const { publicKey } = useWalletPassThrough();
  const { accounts, nativeAccount } = useAccounts();
  const {
    form,
    setForm,
    errors,
    fromTokenInfo,
    toTokenInfo,
    quoteResponseMeta,
    formProps: { fixedAmount, fixedInputMint, fixedOutputMint, swapMode },
    loading,
    refresh,
    quoteError,
    isToPairFocused,
  } = useSwapContext();
  const [hasExpired, timeDiff] = useTimeDiff();

  useEffect(() => {
    if (hasExpired) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExpired]);

  const walletPublicKey = useMemo(() => publicKey?.toString(), [publicKey]);

  const listOfSuggestions = useSuggestionTags({
    fromTokenInfo,
    toTokenInfo,
    quoteResponse: quoteResponseMeta?.quoteResponse,
  });

  const onChangeFromValue = ({ value, floatValue, formattedValue }: NumberFormatValues) => {
    if (value === '' || !floatValue) {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, fromValue: value }));
  };

  const onChangeToValue = ({ value, floatValue, formattedValue }: NumberFormatValues) => {
    if (value === '' || !floatValue) {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(value);
    if (isInvalid) return;

    setForm((form) => ({ ...form, toValue: value }));
  };

  const balance: string | null = useMemo(() => {
    if (!fromTokenInfo?.address) return null;

    const accBalanceObj =
      fromTokenInfo?.address === WRAPPED_SOL_MINT.toString() ? nativeAccount : accounts[fromTokenInfo.address];
    if (!accBalanceObj) return '';

    return accBalanceObj.balance;
  }, [accounts, fromTokenInfo?.address, nativeAccount]);

  const onClickMax = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      if (!balance) return;
      if (fromTokenInfo?.address === WRAPPED_SOL_MINT.toBase58()) {
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
    [balance, fromTokenInfo?.address, setForm],
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

  const hasFixedMint = useMemo(() => fixedInputMint || fixedOutputMint, [fixedInputMint, fixedOutputMint]);
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
    if (fixedInputMint) return;
    setSelectPairSelector('fromMint');
  }, [fixedInputMint, setSelectPairSelector]);

  const onClickSelectToMint = useCallback(() => {
    if (fixedOutputMint) return;
    setSelectPairSelector('toMint');
  }, [fixedOutputMint, setSelectPairSelector]);

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
        setIsWalletModalOpen(true);
      }
    },
    [setIsWalletModalOpen],
  );

  return (
    <div className="h-full flex flex-col items-center justify-center pb-4">
      <div className="w-full mt-2 rounded-xl flex flex-col px-2">
        <div className="flex-col">
          <div className={cn('border-b border-transparent bg-v3-input-background rounded-xl transition-all')}>
            <div className={cn('px-x border-transparent rounded-xl')}>
              <div>
                <div
                  className={cn(
                    'py-5 px-4 flex flex-col dark:text-white border border-transparent',
                    'group focus-within:border-v3-primary/50 focus-within:shadow-swap-input-dark rounded-xl',
                  )}
                >
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 rounded-2xl flex items-center bg-[#1A2633] hover:bg-white/20 text-white"
                      disabled={fixedInputMint}
                      onClick={onClickSelectFromMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon info={fromTokenInfo} width={20} height={20} />
                      </div>
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {fromTokenInfo?.symbol}
                      </div>
                      {fixedInputMint ? null : (
                        <span className="text-white/25 fill-current">
                          <ChevronDownIcon />
                        </span>
                      )}
                    </button>

                    <div className="text-right">
                      {fromTokenInfo?.decimals && (
                        <NumericFormat
                          disabled={fixedAmount || swapMode === SwapMode.ExactOut}
                          value={typeof form.fromValue === 'undefined' ? '' : form.fromValue}
                          decimalScale={fromTokenInfo.decimals}
                          thousandSeparator={thousandSeparator}
                          allowNegative={false}
                          valueIsNumericString
                          onValueChange={onChangeFromValue}
                          placeholder={'0.00'}
                          className={cn('h-full w-full bg-transparent text-white text-right font-semibold text-lg', {
                            'cursor-not-allowed': inputAmountDisabled || swapMode === SwapMode.ExactOut,
                          })}
                          onKeyDown={() => {
                            isToPairFocused.current = false;
                          }}
                          decimalSeparator={detectedSeparator}
                          isAllowed={withValueLimit}
                        />
                      )}
                    </div>
                  </div>

                  {fromTokenInfo?.address ? (
                    <div className="flex justify-between items-center">
                      <div
                        className={cn(
                          'flex mt-3 space-x-1 text-xs items-center text-white/50 fill-current cursor-pointer',
                        )}
                        onClick={(e) => {
                          onClickMax(e);
                        }}
                      >
                        <WalletIcon width={10} height={10} />
                        <CoinBalance mintAddress={fromTokenInfo.address} />
                        <span>{fromTokenInfo.symbol}</span>
                      </div>

                      {form.fromValue ? (
                        <span className="text-xs text-white/50">
                          <CoinBalanceUSD tokenInfo={fromTokenInfo} amount={form.fromValue} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className={'my-2'}>
            {hasFixedMint ? null : <SwitchPairButton onClick={onClickSwitchPair} className={cn('transition-all')} />}
          </div>

          <div className="border-b border-transparent bg-v3-input-background rounded-xl">
            <div className="px-x border-transparent rounded-xl">
              <div>
                <div
                  className={cn(
                    'py-5 px-4 flex flex-col dark:text-white border border-transparent',
                    'group focus-within:border-v3-primary/50 focus-within:shadow-swap-input-dark rounded-xl',
                  )}
                >
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 rounded-2xl flex items-center bg-[#1A2633] hover:bg-white/20 disabled:hover:bg-[#1A2633] text-white"
                      disabled={fixedOutputMint}
                      onClick={onClickSelectToMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon info={toTokenInfo} width={20} height={20} />
                      </div>
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {toTokenInfo?.symbol}
                      </div>

                      {fixedOutputMint ? null : (
                        <span className="text-white/25 fill-current">
                          <ChevronDownIcon />
                        </span>
                      )}
                    </button>

                    <div className="text-right">
                      {toTokenInfo?.decimals && (
                        <NumericFormat
                          disabled={outputAmountDisabled || swapMode === SwapMode.ExactIn}
                          value={typeof form.toValue === 'undefined' ? '' : form.toValue}
                          decimalScale={toTokenInfo.decimals}
                          thousandSeparator={thousandSeparator}
                          allowNegative={false}
                          valueIsNumericString
                          onValueChange={onChangeToValue}
                          className={cn(
                            'h-full w-full bg-transparent text-white text-right font-semibold   text-lg',
                            {
                              'placeholder:text-sm placeholder:font-normal placeholder:text-v2-lily/20':
                                swapMode === SwapMode.ExactOut,
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
                    </div>
                  </div>

                  {toTokenInfo?.address ? (
                    <div className="flex justify-between items-center">
                      <div className="flex mt-3 space-x-1 text-xs items-center text-white/50 fill-current">
                        <WalletIcon width={10} height={10} />
                        <CoinBalance mintAddress={toTokenInfo.address} />
                        <span>{toTokenInfo.symbol}</span>
                      </div>

                      {form.toValue ? (
                        <span className="text-xs text-white/50">
                          <CoinBalanceUSD tokenInfo={toTokenInfo} amount={form.toValue} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SuggestionTags loading={loading} listOfSuggestions={listOfSuggestions} />

      </div>

      <div className="w-full px-2">
        {!walletPublicKey ? (
          <UnifiedWalletButton
            buttonClassName="!bg-transparent"
            overrideContent={
              <JupButton size="lg" className="w-full mt-4" type="button" onClick={handleClick}>
                Connect Wallet
              </JupButton>
            }
          />
        ) : (
          <JupButton
            size="lg"
            className={cn(
              'w-full mt-4 disabled:opacity-50 !text-uiv2-text/75 leading-none !max-h-14 bg-gradient-to-r from-[#00BEF0] to-[#C7F284]',
            )}
            type="button"
            onClick={onSubmit}
            disabled={isDisabled || loading}
          >
            {loading ? (
              <span className="text-sm">Loading...</span>
            ) : quoteError ? (
              <span className="text-sm">Error fetching route. Try changing your input</span>
            ) : errors.fromValue ? (
              <span className="text-sm">{errors.fromValue.title}</span>
            ) : (
              <span>Swap</span>
            )}
          </JupButton>
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
