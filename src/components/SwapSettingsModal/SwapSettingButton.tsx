import React, { HTMLAttributes, useMemo } from 'react';
import { useSwapContext } from 'src/contexts/SwapContext';

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
  const {
    formProps: { darkMode },
  } = useSwapContext();
  const classes = `relative flex-1 py-4 px-1 ${darkMode ? 'text-white/50 bg-[#1B1B1E]' : 'bg-gray-400 text-black/50'}`;
  const roundBorderClass = (() => {
    if (roundBorder === 'left') return 'v2-border-gradient-left';
    if (roundBorder === 'right') return 'v2-border-gradient-right';
  })();

  const borderClassName = useMemo(() => {
    if (idx > 0 && idx < itemsCount) return 'border-l border-black/10 border-white/5';
  }, [idx, itemsCount]);

  return (
    <button
      type="button"
      className={`${
        highlighted ? `v2-border-gradient ${roundBorderClass} bg-v2-gradient bg-transparent` : ''
      } ${borderClassName} ${classes} ${className} relative`}
      onClick={onClick}
    >
      <div className={`h-full w-full leading-none flex justify-center items-center`}>{children}</div>
    </button>
  );
};

export default SwapSettingButton;
