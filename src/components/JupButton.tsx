import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from 'src/misc/cn';

interface IJupButton {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: ReactNode;
  className?:  ButtonHTMLAttributes<HTMLButtonElement>['className'];
  size?: 'sm' | 'md' | 'lg';
}

const JupButton = React.forwardRef(
  ({ onClick, disabled, children, className = '', size = 'md' }: IJupButton, ref: React.ForwardedRef<any>) => {
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
    return (
      <button
        type={'button'}
        ref={ref}
        className={cn("rounded-xl",{
          relative: true,
          'opacity-50 cursor-not-allowed': disabled,
          [className]: true,
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
