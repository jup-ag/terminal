import { ZERO } from '@jup-ag/math';
import { QuoteResponse, SwapMode, TransactionFeeInfo, calculateFeeForSwap } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import React, { useEffect, useMemo, useState } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { formatNumber } from 'src/misc/utils';
import ExchangeRate from '../ExchangeRate';
import Deposits from './Deposits';
import Fees from './Fees';
import TransactionFee from './TransactionFee';
import { useAccounts } from 'src/contexts/accounts';

const Index = ({
  quoteResponse,
  fromTokenInfo,
  toTokenInfo,
  loading,
  showFullDetails = false,
  containerClassName,
  darkMode = false,
}: {
  quoteResponse: QuoteResponse;
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
  loading: boolean;
  showFullDetails?: boolean;
  containerClassName?: string;
  darkMode?: boolean;
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

  const otherAmountThresholdText = useMemo(() => {
    if (quoteResponse?.otherAmountThreshold) {
      const amount = new Decimal(quoteResponse.otherAmountThreshold.toString()).div(Math.pow(10, toTokenInfo.decimals));

      const amountText = formatNumber.format(amount.toNumber());
      return `${amountText} ${toTokenInfo.symbol}`;
    }
    return '-';
  }, [quoteResponse]);

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
    jupiter: { priorityFeeInSOL },
  } = useSwapContext();

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
