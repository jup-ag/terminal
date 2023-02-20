import { useCallback, useEffect, useMemo } from 'react';
import { NumericFormat } from 'react-number-format';

import { useAccounts } from '../contexts/accounts';

import { MINIMUM_SOL_BALANCE } from '../misc/constants';

import CoinBalance from './Coinbalance';
import FormError from './FormError';
import JupButton from './JupButton';

import TokenIcon from './TokenIcon';

import { WRAPPED_SOL_MINT } from '../constants';
import { useSwapContext } from 'src/contexts/SwapContext';
import useTimeDiff from './useTimeDiff/useTimeDiff';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import WalletIcon from 'src/icons/WalletIcon';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import PriceInfo from './PriceInfo/index';
import { RoutesSVG } from 'src/icons/RoutesSVG';
import SexyChameleonText from './SexyChameleonText/SexyChameleonText';
import SwitchPairButton from './SwitchPairButton';
import { SwapMode } from '@jup-ag/react-hook';
import classNames from 'classnames';
import { detectedSeparator } from 'src/misc/utils';

const Form: React.FC<{
  onSubmit: () => void;
  isDisabled: boolean;
  setSelectPairSelector: React.Dispatch<React.SetStateAction<'fromMint' | 'toMint' | null>>;
  setIsWalletModalOpen(toggle: boolean): void;
  setShowRouteSelector(toggle: boolean): void;
}> = ({ onSubmit, isDisabled, setSelectPairSelector, setIsWalletModalOpen, setShowRouteSelector }) => {
  const { connect, wallet } = useWalletPassThrough();
  const { accounts } = useAccounts();
  const {
    form,
    setForm,
    errors,
    fromTokenInfo,
    toTokenInfo,
    selectedSwapRoute,
    formProps: {
      swapMode,
      fixedAmount,
      fixedInputMint,
      fixedOutputMint,
    },
    jupiter: { routes, loading, refresh },
  } = useSwapContext();
  const [hasExpired, timeDiff] = useTimeDiff();

  useEffect(() => {
    if (hasExpired) {
      refresh();
    }
  }, [hasExpired]);

  const onConnectWallet = () => {
    if (wallet) connect();
    else {
      setIsWalletModalOpen(true);
    }
  };

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const onChangeFromValue = (floatValue?: number) => {
    if (!floatValue) return;
    const isInvalid = Number.isNaN(floatValue);
    if (isInvalid) return;

    setForm((form) => ({ ...form, fromValue: String(floatValue) }));
  };

  const onChangeToValue = (floatValue?: number) => {
    if (!floatValue) {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }));
      return;
    }

    const isInvalid = Number.isNaN(floatValue);
    if (isInvalid) {
      setForm((form) => ({ ...form, fromValue: '', toValue: String(floatValue) }));
      return;
    };

    setForm((form) => ({ ...form, toValue: String(floatValue) }));
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
      if (swapMode === SwapMode.ExactOut) {
        result.outputAmountDisabled = false;
      } else {
        result.inputAmountDisabled = false;
      }
    }
    return result;
  }, [fixedAmount, swapMode]);

  const marketRoutes = selectedSwapRoute ? selectedSwapRoute.marketInfos.map(({ label }) => label).join(', ') : '';

  const onClickSelectFromMint = useCallback(() => {
    if (fixedInputMint) return;
    setSelectPairSelector('fromMint')
  }, [fixedInputMint])

  const onClickSelectToMint = useCallback(() => {
    if (fixedOutputMint) return;
    setSelectPairSelector('toMint')
  }, [fixedOutputMint])

  const fixedOutputFomMintClass = useMemo(() => {
    if (swapMode === 'ExactOut' && !form.toValue) return 'opacity-20 hover:opacity-100';
    return '';
  }, [fixedOutputMint, form.toValue])


  const thousandSeparator = useMemo(() => detectedSeparator === ',' ? '.' : ',', []);
  return (
    <div className="h-full flex flex-col items-center justify-center pb-4">
      <div className="w-full mt-2 rounded-xl flex flex-col px-2">
        <div className="flex-col">
          <div className={classNames("border-b border-transparent bg-[#212128] rounded-xl transition-all", fixedOutputFomMintClass)}>
            <div className={classNames("px-x border-transparent rounded-xl ")}>
              <div>
                <div className={classNames("py-5 px-4 flex flex-col dark:text-white")}>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 rounded-2xl flex items-center bg-[#36373E] hover:bg-white/20 text-white"
                      disabled={fixedInputMint}
                      onClick={onClickSelectFromMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon tokenInfo={fromTokenInfo} width={20} height={20} />
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
                      <NumericFormat
                        value={typeof form.fromValue === 'undefined' ? '' : form.fromValue}
                        decimalScale={fromTokenInfo?.decimals}
                        thousandSeparator={thousandSeparator}
                        allowNegative={false}
                        onValueChange={({ floatValue }) => {
                          onChangeFromValue(floatValue)
                        }}
                        maxLength={12}
                        placeholder={'0.00'}
                        className={classNames("h-full w-full bg-transparent text-white text-right font-semibold dark:placeholder:text-white/25 text-lg", { 'cursor-not-allowed': inputAmountDisabled })}
                        decimalSeparator={detectedSeparator}
                      />
                    </div>
                  </div>

                  {fromTokenInfo?.address ? (
                    <div
                      className={classNames("flex mt-3 space-x-1 text-xs items-center text-white/30 fill-current", { "cursor-pointer": swapMode !== 'ExactOut' })}
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

          <div className={"my-2"}>{hasFixedMint ? null : <SwitchPairButton onClick={onClickSwitchPair} className={classNames("transition-all", fixedOutputFomMintClass)} />}</div>

          <div className="border-b border-transparent bg-[#212128] rounded-xl">
            <div className="px-x border-transparent rounded-xl">
              <div>
                <div className="py-5 px-4 flex flex-col dark:text-white">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 rounded-2xl flex items-center bg-[#36373E] hover:bg-white/20 disabled:hover:bg-[#36373E] text-white"
                      disabled={fixedOutputMint}
                      onClick={onClickSelectToMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon tokenInfo={toTokenInfo} width={20} height={20} />
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
                    <NumericFormat
                        value={typeof form.toValue === 'undefined' ? '' : form.toValue}
                        decimalScale={toTokenInfo?.decimals}
                        thousandSeparator={thousandSeparator}
                        allowNegative={false}
                        onValueChange={({ floatValue }) => {
                          onChangeToValue(floatValue)
                        }}
                        maxLength={12}
                        placeholder={swapMode === 'ExactOut' ? 'Enter desired amount' : ''}
                        className={classNames("h-full w-full bg-transparent text-white text-right font-semibold dark:placeholder:text-white/25 placeholder:text-sm placeholder:font-normal text-lg")}
                        decimalSeparator={detectedSeparator}
                      />
                    </div>
                  </div>

                  {toTokenInfo?.address ? (
                    <div className="flex mt-3 space-x-1 text-xs items-center text-white/30 fill-current">
                      <WalletIcon width={10} height={10} />
                      <CoinBalance mintAddress={toTokenInfo.address} />
                      <span>{toTokenInfo.symbol}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {routes ? (
            <div className="flex items-center mt-2 text-xs space-x-1">
              <div
                className="bg-black/20 rounded-xl px-2 py-1 cursor-pointer text-white/50 flex items-center space-x-1"
                onClick={() => setShowRouteSelector(true)}
              >
                <span>{routes?.length}</span>
                <RoutesSVG width={7} height={9} />
              </div>
              <span className="text-white/30">using</span>
              <span className="text-white/50">{marketRoutes}</span>
            </div>
          ) : null}
        </div>

        {walletPublicKey ? <FormError errors={errors} /> : null}
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
            {loading ? <span className="text-sm">Loading...</span> : <SexyChameleonText>Swap</SexyChameleonText>}
          </JupButton>
        )}

        {routes && selectedSwapRoute && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            routes={routes}
            selectedSwapRoute={selectedSwapRoute}
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
