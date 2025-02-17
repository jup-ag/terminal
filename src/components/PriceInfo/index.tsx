import { ZERO } from '@jup-ag/math';
import { TransactionFeeInfo, calculateFeeForSwap } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import classNames from 'classnames';
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
    inAmount: quoteResponse?.quoteResponse.inAmount || ZERO, // If there's no selectedRoute, we will use first route value to temporarily calculate
    inputDecimal: fromTokenInfo.decimals,
    outAmount: quoteResponse?.quoteResponse.outAmount || ZERO, // If there's no selectedRoute, we will use first route value to temporarily calculate
    outputDecimal: toTokenInfo.decimals,
  };

  const { accounts } = useAccounts();

  const { wallet } = useWalletPassThrough();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const priceImpact = formatNumber.format(
    new Decimal(quoteResponse?.quoteResponse.priceImpactPct || 0).mul(100).toDP(4),
  );
  const priceImpactText = Number(priceImpact) < 0.1 ? `< ${formatNumber.format('0.1')}%` : `~ ${priceImpact}%`;

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

  const [feeInformation, setFeeInformation] = useState<TransactionFeeInfo>();

  const mintToAccountMap = useMemo(() => {
    return new Map(Object.entries(accounts).map((acc) => [acc[0], acc[1].pubkey.toString()]));
  }, [accounts]);

  useEffect(() => {
    if (quoteResponse) {
      const fee = calculateFeeForSwap(
        quoteResponse.quoteResponse as any,
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

  return (
    <div className={classNames('mt-4 space-y-4 border border-white/5 rounded-xl p-3', containerClassName)}>
      <div className="flex items-center justify-between text-xs">
        <div className="text-white/50">{<span>Rate</span>}</div>
        {JSBI.greaterThan(rateParams.inAmount, ZERO) && JSBI.greaterThan(rateParams.outAmount, ZERO) ? (
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

      <div className="flex items-center justify-between text-xs">
        <div className="text-white/50">
          <span>Minimum Received</span>
        </div>
        <div className="text-white/50">{otherAmountThresholdText}</div>
      </div>

      {showFullDetails ? (
        <>
          <Fees routePlan={quoteResponse?.quoteResponse.routePlan} />
          <TransactionFee feeInformation={feeInformation} />
          <Deposits hasSerumDeposit={hasSerumDeposit} hasAtaDeposit={hasAtaDeposit} feeInformation={feeInformation} />
        </>
      ) : null}
    </div>
  );
};

export default Index;
