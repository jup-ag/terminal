import React from 'react';

interface ISwapSettingButton {
  onClick(): void;
  highlighted: boolean;
  children: React.ReactNode;
}

const SwapSettingButton = ({ onClick, highlighted, children }: ISwapSettingButton) => {
  const classes = 'relative flex-1 py-5 text-white-50 bg-black-25 w-16 h-14';
  return (
    <button
      type="button"
      className={`${
        highlighted ? 'jup-gradient bg-transparent' : 'bg-black/30'
      } ${classes} relative rounded-xl`}
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 h-full w-full" />
      <div className={`h-full w-full leading-none flex justify-center items-center`}>{children}</div>
    </button>
  );
};

export default SwapSettingButton;
