import React from 'react';
import Decimal from 'decimal.js';

function generateSubscriptNumbers(x: number): string {
  const subscriptNumbers: string[] = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  const xString: string = x.toString();
  let result: string = '';

  for (let i = 0; i < xString.length; i++) {
    const digit: number = parseInt(xString.charAt(i), 10);
    const subscriptNumber: string = subscriptNumbers[digit];
    result += subscriptNumber;
  }

  return result;
}

const usePrecisionTick = (value: number): [number, string, string] => {
  const firstSD = Decimal.abs(Decimal.ceil(new Decimal(-1).mul(Decimal.log10(value)))).toNumber();
  const [prefix, suffix] = [
    new Decimal(value).toFixed().slice(0, firstSD + 2), // +2 to account for 0.
    new Decimal(value).toFixed().slice(firstSD + 1), // +1 to account for 0. - and slice index
  ];

  return [firstSD, prefix, suffix];
};

const PrecisionTickSize: React.FC<{ value: number; maxSuffix?: number }> = ({ value, maxSuffix }) => {
  const [firstSD, _, suffix] = usePrecisionTick(value);

  if (firstSD <= 5) {
    return <span>{value.toFixed(6)}</span>;
  }

  return (
    <span className='flex items-center h-4'>
      0.0
      <span className='mb-3 text-xl mx-0.5'>{generateSubscriptNumbers(firstSD - 1)}</span>
      {suffix.slice(0, maxSuffix)}
    </span>
  );
};

export default PrecisionTickSize;
