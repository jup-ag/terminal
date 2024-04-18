import { ZERO } from '@jup-ag/math';
import { QuoteResponse, SwapMode, TransactionFeeInfo, calculateFeeForSwap } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import axios from 'axios';
import numeral from 'numeral';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import React, { useEffect, useMemo, useState } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { useUSDValueProvider } from 'src/contexts/USDValueProvider';
import { formatNumber } from 'src/misc/utils';
import ExchangeRate from '../ExchangeRate';
import Deposits from './Deposits';
import Fees from './Fees';
import TransactionFee from './TransactionFee';
import { useAccounts } from 'src/contexts/accounts';
import PlatformFees, { PlatformFeesInfo } from './PlatformFees';

const Index = ({
  quoteResponse,
  fromTokenInfo,
  toTokenInfo,
  loading,
  showFullDetails = false,
  containerClassName,
  darkMode = false,
  gmPointCoefficient = 0,
}: {
  quoteResponse: QuoteResponse;
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
  loading: boolean;
  showFullDetails?: boolean;
  containerClassName?: string;
  darkMode?: boolean;
  gmPointCoefficient?: number;
}) => {
  const rateParams = {
    inAmount: quoteResponse?.inAmount || ZERO, // If there's no selectedRoute, we will use first route value to temporarily calculate
    inputDecimal: fromTokenInfo.decimals,
    outAmount: quoteResponse?.outAmount || ZERO, // If there's no selectedRoute, we will use first route value to temporarily calculate
    outputDecimal: toTokenInfo.decimals,
  };

  const { accounts } = useAccounts();

  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const priceImpact = formatNumber.format(new Decimal(quoteResponse?.priceImpactPct || 0).mul(100).toDP(4).toNumber());
  const priceImpactText = Number(priceImpact) < 0.1 ? `< ${formatNumber.format(0.1)}%` : `~ ${priceImpact}%`;

  const [feeInformation, setFeeInformation] = useState<TransactionFeeInfo>();

  const mintToAccountMap = useMemo(() => {
    return new Map(Object.entries(accounts).map((acc) => [acc[0], acc[1].pubkey.toString()]));
  }, [accounts]);

  useEffect(() => {
    if (quoteResponse) {
      const fee = calculateFeeForSwap(
        quoteResponse,
        mintToAccountMap,
        new Map(), // we can ignore this as we are using shared accounts
        true,
        true,
      );
      setFeeInformation(fee);
    } else {
      setFeeInformation(undefined);
    }
  }, [quoteResponse, walletPublicKey, mintToAccountMap]);

  const hasAtaDeposit = (feeInformation?.ataDeposits.length ?? 0) > 0;
  const hasSerumDeposit = (feeInformation?.openOrdersDeposits.length ?? 0) > 0;

  const {
    form,
    jupiter: { priorityFeeInSOL },
  } = useSwapContext();

  const { publicKey } = useWalletPassThrough();
  const [dataPnl, setDataPnl] = useState(0);

  const { tokenPriceMap } = useUSDValueProvider();

  const handlePnlCalculate = async () => {
    try {
      const payload = {
        owner: publicKey?.toBase58(),
        from: {
          address: fromTokenInfo?.address,
          symbol: fromTokenInfo?.symbol,
          quantity: Number(form.fromValue),
          price: Number(tokenPriceMap[fromTokenInfo?.address || '']?.usd || 0),
        },
        to: {
          address: toTokenInfo?.address,
          symbol: toTokenInfo?.symbol,
          quantity: Number(form.toValue),
          price: Number(tokenPriceMap[toTokenInfo?.address || '']?.usd || 0),
        },
      };

      if (!payload.from.price) {
        setDataPnl(0);
        return;
      }

      const res = await axios.post(`https://api.getnimbus.io/swap/pnl?chain=${fromTokenInfo?.chainId}`, payload);

      if (res?.data?.data && res?.data?.data !== 0) {
        setDataPnl(res?.data?.data);
      } else {
        setDataPnl(0);
      }
    } catch (e) {
      setDataPnl(0);
      console.error(e);
    }
  };

  const otherAmountThresholdText = useMemo(() => {
    if (quoteResponse?.otherAmountThreshold) {
      handlePnlCalculate();
      const amount = new Decimal(quoteResponse.otherAmountThreshold.toString()).div(Math.pow(10, toTokenInfo.decimals));

      const amountText = formatNumber.format(amount.toNumber());
      return `${amountText} ${toTokenInfo.symbol}`;
    }
    return '-';
  }, [quoteResponse]);

  const pnl = useMemo(() => {
    return dataPnl !== 0 ? Number(dataPnl?.newRealizedPnL) : 0;
  }, [dataPnl]);

  const pnlPercent = useMemo(() => {
    return dataPnl !== 0
      ? Number(dataPnl?.cost) !== 0
        ? Number(dataPnl?.newRealizedPnL) / Number(dataPnl?.cost)
        : 0
      : 0;
  }, [dataPnl]);

  return (
    <div
      className={`mt-4 space-y-4 border rounded-xl p-3 ${
        darkMode ? 'border-white/5' : 'border-[#0000001a]'
      } ${classNames(containerClassName)}`}
    >
      <div className="flex items-center justify-between text-xs">
        <div className={`${darkMode ? 'text-white/30' : 'text-black'}`}>{<span>Rate</span>}</div>
        {JSBI.greaterThan(rateParams.inAmount, ZERO) && JSBI.greaterThan(rateParams.outAmount, ZERO) ? (
          <span className={`${darkMode ? 'text-white/30' : 'text-black'}`}>
            <ExchangeRate
              darkMode={darkMode}
              loading={loading}
              rateParams={rateParams}
              fromTokenInfo={fromTokenInfo}
              toTokenInfo={toTokenInfo}
              reversible={true}
            />
          </span>
        ) : (
          <span className={`${darkMode ? 'text-white/30' : 'text-black'}`}>{'-'}</span>
        )}
      </div>

      <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-white/30' : 'text-black'}`}>
        <div>
          <span>Price Impact</span>
        </div>
        <div>{priceImpactText}</div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className={`${darkMode ? 'text-white/30' : 'text-black'}`}>
          {quoteResponse?.swapMode === SwapMode.ExactIn ? <span>Minimum Received</span> : <span>Maximum Consumed</span>}
        </div>
        <div className={`${darkMode ? 'text-white/30' : 'text-black'}`}>{otherAmountThresholdText}</div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className={`${darkMode ? 'text-white/30' : 'text-black'}`}>PnL</div>
        <div className={`${darkMode ? 'text-white/30' : 'text-black'}`}>
          <span className={`flex items-center gap-1 ${pnl === 0 ? '' : pnl > 0 ? 'text-[#00a878]' : 'text-[#f05252]'}`}>
            {dataPnl !== 0
              ? `$${numeral(Math.abs(pnl)).format('0,0.00')} (${numeral(Number(pnlPercent) * 100).format('0,0.00')}%)`
              : '$0'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="text-[#e3a008]">GM Points</div>
        <div className="flex items-center gap-2 text-[#e3a008]">
          <div>🔶</div>{' '}
          {Math.round(Number(tokenPriceMap[fromTokenInfo?.address || '']?.usd || 0) * Number(gmPointCoefficient))}
        </div>
      </div>

      {showFullDetails ? (
        <>
          <Fees
            darkMode={darkMode}
            routePlan={quoteResponse?.routePlan}
            swapMode={quoteResponse.swapMode as SwapMode}
          />
          <TransactionFee darkMode={darkMode} feeInformation={feeInformation} />
          <Deposits
            darkMode={darkMode}
            hasSerumDeposit={hasSerumDeposit}
            hasAtaDeposit={hasAtaDeposit}
            feeInformation={feeInformation}
          />
          {(quoteResponse as QuoteResponse & PlatformFeesInfo).platformFee ? (
            <PlatformFees
              platformFee={(quoteResponse as QuoteResponse & PlatformFeesInfo).platformFee}
              tokenInfo={quoteResponse?.swapMode === SwapMode.ExactIn ? toTokenInfo : fromTokenInfo}
            />
          ) : null}

          {priorityFeeInSOL > 0 ? (
            <div className="flex items-center justify-between text-xs">
              <div className={`${darkMode ? 'text-white/30' : 'text-black'}`}>Priority Fee</div>
              <div className={`${darkMode ? 'text-white/30' : 'text-black'}`}>
                {new Decimal(priorityFeeInSOL).toString()}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default Index;
