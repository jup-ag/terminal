import classNames from 'classnames';
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface IJupButton {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  // JupButton border gradient, globals.css
  highlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  bgClass?: string;
  rounded?: string;
  darkMode?: boolean;
}

const JupButton = React.forwardRef(
  (
    {
      onClick,
      disabled,
      children,
      highlighted,
      className = '',
      size = 'md',
      type,
      bgClass,
      rounded,
      darkMode = false,
    }: IJupButton,
    ref: React.ForwardedRef<any>,
  ) => {
    const contentClass = (() => {
      if (size === 'sm') {
        return 'px-4 py-2.5 text-xs';
      }
      if (size === 'md') {
        return 'px-4 py-3 text-sm font-semibold';
      }
      if (size === 'lg') {
        return 'p-5 text-md font-semibold';
      }
    })();
    const background = bgClass || darkMode ? 'text-white bg-[#191B1F]' : 'text-white bg-gray-600';
    return (
      <button
        type={type}
        ref={ref}
        className={classNames({
          relative: true,
          'jup-gradient': highlighted,
          'opacity-50 cursor-not-allowed': disabled,
          [background]: true,
          [className]: true,
          [rounded || 'rounded-xl']: true,
        })}
        disabled={disabled}
        onClick={onClick}
      >
        <div className={`${contentClass} h-full w-full leading-none`}>{children}</div>
      </button>
    );
  },
);

JupButton.displayName = 'JupButton';

export default JupButton;
