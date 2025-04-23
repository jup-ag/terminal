import { TransactionFeeInfo, calculateFeeForSwap } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import { useEffect, useMemo, useState } from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { useAccounts } from 'src/contexts/accounts';
import { formatNumber } from 'src/misc/utils';
import ExchangeRate from '../ExchangeRate';
import Deposits from './Deposits';
import Fees from './Fees';
import TransactionFee from './TransactionFee';
import { QuoteResponse } from 'src/contexts/SwapContext';
import { cn } from 'src/misc/cn';
import { useUltraRouters } from 'src/queries/useUltraRouter';

const Index = ({
  quoteResponse,
  fromTokenInfo,
  toTokenInfo,
  loading,
  showFullDetails = false,
  containerClassName,
}: {
  quoteResponse: QuoteResponse;
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
  loading: boolean;
  showFullDetails?: boolean;
  containerClassName?: string;
}) => {
  const rateParams = {
    inAmount: quoteResponse?.quoteResponse.inAmount || JSBI.BigInt(0), // If there's no selectedRoute, we will use first route value to temporarily calculate
    inputDecimal: fromTokenInfo.decimals,
    outAmount: quoteResponse?.quoteResponse.outAmount || JSBI.BigInt(0), // If there's no selectedRoute, we will use first route value to temporarily calculate
    outputDecimal: toTokenInfo.decimals,
  };

  const { accounts } = useAccounts();
  const { data: routers } = useUltraRouters();
  const routerIconUrl = useMemo(() => {
    if (!quoteResponse || !routers) {
      return null;
    }
    return routers.find((router) => router.id === quoteResponse.quoteResponse.router.toLowerCase())?.icon;
  }, [quoteResponse, routers]);

  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const priceImpact = formatNumber.format(
    new Decimal(quoteResponse?.quoteResponse.priceImpactPct || 0).mul(100).toDP(4),
  );
  const priceImpactText = Number(priceImpact) < 0.1 ? `< ${formatNumber.format('0.1')}%` : `~ ${priceImpact}%`;
  const fee = useMemo(() => {
    if (!quoteResponse) {
      return 0;
    }
    return quoteResponse.quoteResponse.feeBps / 100;
  }, [quoteResponse]);

  const otherAmountThresholdText = useMemo(() => {
    if (quoteResponse?.quoteResponse.otherAmountThreshold) {
      const amount = new Decimal(quoteResponse.quoteResponse.otherAmountThreshold.toString()).div(
        Math.pow(10, toTokenInfo.decimals),
      );

      const amountText = formatNumber.format(amount);
      return `${amountText} ${toTokenInfo.symbol}`;
    }
    return '-';
  }, [quoteResponse.quoteResponse.otherAmountThreshold, toTokenInfo.decimals, toTokenInfo.symbol]);

  const router = useMemo(() => {
    if (!quoteResponse) {
      return;
    }
    return quoteResponse.quoteResponse.router;
  }, [quoteResponse]);

  const [feeInformation, setFeeInformation] = useState<TransactionFeeInfo>();

  const mintToAccountMap = useMemo(() => {
    return new Map(Object.entries(accounts).map((acc) => [acc[0], acc[1].pubkey.toString()]));
  }, [accounts]);

  const gasFee = useMemo(() => {
    if (quoteResponse) {
      const { prioritizationFeeLamports } = quoteResponse.quoteResponse;
      if (prioritizationFeeLamports) {
        return prioritizationFeeLamports / 1e9; // Convert lamports to SOL
      }
    }
    return 0;
  }, [quoteResponse]);

  const hasAtaDeposit = (feeInformation?.ataDeposits.length ?? 0) > 0;
  const hasSerumDeposit = (feeInformation?.openOrdersDeposits.length ?? 0) > 0;

  return (
    <div className={cn('mt-4 space-y-4 border border-white/5 rounded-xl p-3', containerClassName)}>
      <div className="flex items-center justify-between text-xs">
        <div className="text-white/50">{<span>Rate</span>}</div>
        {JSBI.greaterThan(rateParams.inAmount, JSBI.BigInt(0)) &&
        JSBI.greaterThan(rateParams.outAmount, JSBI.BigInt(0)) ? (
          <ExchangeRate
            loading={loading}
            rateParams={rateParams}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            reversible={true}
          />
        ) : (
          <span className="text-white/50">{'-'}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <div>
          <span>Price Impact</span>
        </div>
        <div>{priceImpactText}</div>
      </div>

      {router && (
        <div className="flex items-center justify-between text-xs">
          <div className="text-white/50">
            <span>Router</span>
          </div>

          <div className="flex items-center gap-1">
            {/* eslint-disable @next/next/no-img-element */}
            {routerIconUrl && (
              <img src={routerIconUrl} alt={quoteResponse.quoteResponse.router} width={10} height={10} />
            )}
            <div className="text-white/50">{router}</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-xs">
        <div className="text-white/50">
          <span>Fee</span>
        </div>
        <div className="text-white/50">{fee}%</div>
      </div>

      {showFullDetails ? (
        <>
          <TransactionFee gasFee={gasFee} />
          <Deposits hasSerumDeposit={hasSerumDeposit} hasAtaDeposit={hasAtaDeposit} feeInformation={feeInformation} />
          <div className="flex items-center justify-between text-xs">
            <div className="text-white/50">
              <span>Minimum Received</span>
            </div>
            <div className="text-white/50">{otherAmountThresholdText}</div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Index;
