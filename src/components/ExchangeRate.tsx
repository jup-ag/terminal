import { TokenInfo } from '@solana/spl-token-registry';

import classnames from 'classnames';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import * as React from 'react';

import { formatNumber, fromLamports } from '../misc/utils';
import PrecisionTickSize from './PrecisionTickSize';

export interface IRateParams {
  inAmount: JSBI;
  inputDecimal: number;
  outAmount: JSBI;
  outputDecimal: number;
}

export const calculateRate = (
  { inAmount, inputDecimal, outAmount, outputDecimal }: IRateParams,
  reverse: boolean,
): Decimal => {
  const input = fromLamports(inAmount, inputDecimal);
  const output = fromLamports(outAmount, outputDecimal);

  const rate = !reverse ? new Decimal(input).div(output) : new Decimal(output).div(input);

  if (Number.isNaN(rate.toNumber())) {
    return new Decimal(0);
  }

  return rate;
};

const ApproxSVG = ({ width = 16, height = 16 }: { width?: string | number; height?: string | number }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.8573 8.18429L13.6323 5.95933L10.8573 3.73438V5.31937H3.32735V6.59937H10.8573V8.18429ZM5.14223 7.81429L2.36719 10.0393L5.14223 12.2642V10.6792H12.6722V9.39922H5.14223V7.81429Z"
        fill="#777777"
      />
    </svg>
  );
};

interface ExchangeRateProps {
  className?: string;
  textClassName?: string;
  loading?: boolean;
  fromTokenInfo: TokenInfo;
  rateParams: IRateParams;
  toTokenInfo: TokenInfo;
  reversible?: boolean;
}

const ExchangeRate = ({
  className,
  textClassName,
  loading = false,
  fromTokenInfo,
  rateParams,
  toTokenInfo,
  reversible = true,
}: ExchangeRateProps) => {
  const [reverse, setReverse] = React.useState(reversible ?? true);

  const rate = React.useMemo(() => calculateRate(rateParams, reverse), [loading, reverse, rateParams])

  const onReverse: React.MouseEventHandler = React.useCallback((event) => {
    event.stopPropagation();
    setReverse((prevState) => !prevState);
  }, []);

  return (
    <div
      className={classnames(className, 'flex cursor-pointer text-white/30 text-xs align-center')}
      onClick={onReverse}
    >
      <span className={classnames(textClassName, 'max-w-full flex whitespace-nowrap')}>
        {reverse ? (
          <>
            1 {fromTokenInfo.symbol} ≈
            <div className='flex ml-0.5'>
              {rate.gt(0.000_01) ?
                (
                  `${formatNumber.format(rate.toNumber())} ${toTokenInfo.symbol}`
                )
                : (
                  <>
                    <PrecisionTickSize value={rate.toNumber()} maxSuffix={6} /> {toTokenInfo.symbol}
                  </>
                )}
            </div>
          </>
        ) : (
          <>
            1 {toTokenInfo.symbol} ≈
            <div className='flex ml-0.5'>

              {rate.gt(0.000_01) ?
                (
                  `${formatNumber.format(rate.toNumber())} ${fromTokenInfo.symbol}`
                )
                : (
                  <>
                    <PrecisionTickSize value={rate.toNumber()} maxSuffix={6} /> {fromTokenInfo.symbol}
                  </>
                )}
            </div>
          </>
        )}
      </span>
      {reversible ? (
        <div className={'ml-2'}>
          <ApproxSVG />
        </div>
      ) : null}
    </div>
  );
};

export default ExchangeRate;
