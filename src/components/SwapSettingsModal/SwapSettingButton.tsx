import classNames from 'classnames';
import React, { HTMLAttributes, useMemo } from 'react';

interface ISwapSettingButton {
  idx: number;
  itemsCount: number;
  className?: HTMLAttributes<HTMLButtonElement>['className'];
  onClick(): void;
  highlighted: boolean;
  roundBorder?: 'left' | 'right';
  children: React.ReactNode;
}

const SwapSettingButton = ({
  idx,
  itemsCount,
  className = '',
  onClick,
  highlighted,
  roundBorder,
  children,
}: ISwapSettingButton) => {
  const classes = `relative flex-1 py-4 px-1 text-white/50 bg-[#1B1B1E]`;
  const roundBorderClass = (() => {
    if (roundBorder === 'left') return 'rounded-l-xl';
    if (roundBorder === 'right') return 'rounded-r-xl';
    return '';
  })();

  const borderClassName = useMemo(() => {
    if (idx > 0 && idx < itemsCount) return 'border-l border-white/10';
  }, [idx, itemsCount]);

  return (
    <button
      type="button"
      className={classNames(
        '!h-[42px] relative border border-transparent',
        borderClassName,
        highlighted ? ` ${roundBorderClass} !border-v3-primary` : '',
        classes,
        className,
      )}
      onClick={onClick}
    >
      <div className={`h-full w-full leading-none flex justify-center items-center`}>{children}</div>
    </button>
  );
};

export default SwapSettingButton;
