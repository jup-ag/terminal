import { ZERO } from '@jup-ag/math';
import { RouteInfo, SwapMode, TransactionFeeInfo } from '@jup-ag/react-hook'
import { TokenInfo } from '@solana/spl-token-registry';
import classNames from 'classnames';
import Decimal from 'decimal.js';
import JSBI from 'jsbi'
import React, { useEffect, useMemo, useState } from 'react'
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { formatNumber } from 'src/misc/utils';
import ExchangeRate from '../ExchangeRate';
import Deposits from './Deposits';
import Fees from './Fees';
import TransactionFee from './TransactionFee';

const Index = ({ routes, selectedSwapRoute, fromTokenInfo, toTokenInfo, loading, showFullDetails = false, containerClassName }: { routes: RouteInfo[], selectedSwapRoute: RouteInfo, fromTokenInfo: TokenInfo, toTokenInfo: TokenInfo, loading: boolean, showFullDetails?: boolean, containerClassName?: string }) => {
  const rateParams = {
    inAmount: selectedSwapRoute?.inAmount || routes?.[0]?.inAmount || ZERO, // If there's no selectedRoute, we will use first route value to temporarily calculate
    inputDecimal: fromTokenInfo.decimals,
    outAmount: selectedSwapRoute?.outAmount || routes?.[0]?.outAmount || ZERO, // If there's no selectedRoute, we will use first route value to temporarily calculate
    outputDecimal: toTokenInfo.decimals,
  };

  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  const priceImpact = formatNumber.format(
    new Decimal(selectedSwapRoute?.priceImpactPct || 0).mul(100).toDP(4).toNumber(),
  );
  const priceImpactText = Number(priceImpact) < 0.1 ? `< ${formatNumber.format(0.1)}%` : `~ ${priceImpact}%`;

  const otherAmountThresholdText = useMemo(() => {
    if (selectedSwapRoute?.otherAmountThreshold) {
      const amount = new Decimal(selectedSwapRoute.otherAmountThreshold.toString()).div(
        Math.pow(10, toTokenInfo.decimals),
      );

      const amountText = formatNumber.format(amount.toNumber());
      return `${amountText} ${toTokenInfo.symbol}`;
    }
    return '-';
  }, [selectedSwapRoute]);

  const [feeInformation, setFeeInformation] = useState<TransactionFeeInfo>();
  useEffect(() => {
    setFeeInformation(undefined);
    if (selectedSwapRoute.fees) {
      setFeeInformation(selectedSwapRoute.fees);
    }
  }, [selectedSwapRoute, walletPublicKey]);

  const hasAtaDeposit = (feeInformation?.ataDeposits.length ?? 0) > 0;
  const hasSerumDeposit = (feeInformation?.openOrdersDeposits.length ?? 0) > 0;

  return (
    <div className={classNames("mt-4 space-y-4 border border-white/5 rounded-xl p-3", containerClassName)}>
      <div className="flex items-center justify-between text-xs">
        <div className="text-white/30">{<span>Rate</span>}</div>
        {JSBI.greaterThan(rateParams.inAmount, ZERO) && JSBI.greaterThan(rateParams.outAmount, ZERO) ? (
          <ExchangeRate
            loading={loading}
            rateParams={rateParams}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            reversible={true}
          />
        ) : (
          <span className="text-white/30">{'-'}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-white/30">
        <div className="">
          <span>Price Impact</span>
        </div>
        <div>{priceImpactText}</div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="text-white/30">
          {selectedSwapRoute?.swapMode === SwapMode.ExactIn ? (
            <span>Minimum Received</span>
          ) : (
            <span>Maximum Consumed</span>
          )}
        </div>
        <div className="text-white/30">{otherAmountThresholdText}</div>
      </div>

      {showFullDetails ? (
        <>
          <Fees marketInfos={selectedSwapRoute?.marketInfos} />
          <TransactionFee feeInformation={feeInformation} />
          <Deposits hasSerumDeposit={hasSerumDeposit} hasAtaDeposit={hasAtaDeposit} feeInformation={feeInformation} />
        </>
      )
        : null}
    </div>
  )
}

export default Index