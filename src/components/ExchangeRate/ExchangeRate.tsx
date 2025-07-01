import { TokenInfo } from '@solana/spl-token-registry';
import * as React from 'react';
import JSBI from 'jsbi';
import PrecisionTickSize from '../PrecisionTickSize';
import { cn } from 'src/misc/cn';
import { formatNumber } from 'src/misc/utils';
import { calculateRate } from '../ExchangeRate';
import ApproxSVG from 'src/icons/ApproxSVG';

interface ExchangeRateProps {
  className?: string;
  textClassName?: string;
  loading?: boolean;
  inputPair: TokenInfo;
  inputAmount: JSBI;
  outputAmount: JSBI;
  outputPair: TokenInfo;
  reversible?: boolean;
}

export const ExchangeRateComponent = ({
  isReversed,
  textClassName,
  loading = false,
  inputPair,
  inputAmount,
  outputAmount,
  outputPair,
  reversible = true,
}: { isReversed: boolean } & ExchangeRateProps) => {
  const rateText = React.useMemo(
    () =>
      loading
        ? '-'
        : formatNumber.format(
            calculateRate(
              {
                inAmount: inputAmount,
                outAmount: outputAmount,
                inputDecimal: inputPair.decimals,
                outputDecimal: outputPair.decimals,
              },
              isReversed,
            ),
            isReversed ? outputPair.decimals : inputPair.decimals,
          ),
    [loading, isReversed, inputAmount, outputAmount, inputPair, outputPair],
  );
  return (
    <>
      <span className={cn(textClassName, 'max-w-full flex items-start whitespace-nowrap')}>
        {isReversed ? (
          <div className="h-4 flex space-x-1">
            <span>1 {inputPair.symbol} ≈</span>
            {Number(rateText) < 0.000_001 ? (
              <PrecisionTickSize value={Number(rateText)} maxSuffix={6} />
            ) : (
              <span>{rateText}</span>
            )}
            <span>{outputPair.symbol}</span>
          </div>
        ) : (
          <div className="h-4 flex space-x-1">
            <span>1 {outputPair.symbol} ≈</span>
            {Number(rateText) < 0.000_001 ? (
              <PrecisionTickSize value={Number(rateText)} maxSuffix={6} />
            ) : (
              <span>{rateText}</span>
            )}
            <span>{inputPair.symbol}</span>
          </div>
        )}
      </span>
      {reversible ? (
        <div className={'ml-2 fill-current'}>
          <ApproxSVG />
        </div>
      ) : null}
    </>
  );
};

const ExchangeRate = (props: ExchangeRateProps) => {
  const { className, reversible } = props;
  const [reverse, setReverse] = React.useState(reversible ?? true);

  const onReverse: React.MouseEventHandler = React.useCallback((event) => {
    event.stopPropagation();
    setReverse((prevState) => !prevState);
  }, []);

  return (
    <div
      className={cn(
        className,
        'flex cursor-pointer text-black-35 dark:text-white-35 align-center hover:text-light-active-state dark:hover:text-primary',
      )}
      onClick={onReverse}
    >
      <ExchangeRateComponent {...props} isReversed={reverse} />
    </div>
  );
};

export default ExchangeRate;
