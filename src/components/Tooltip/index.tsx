import classNames from 'classnames';
import * as React from 'react';

interface TooltipProps {
  className?: string;
  content: string | React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'dark' | 'light';
}

const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
  className,
  content,
  disabled = false,
  variant = 'light',
  onClick,
  children,
}) => {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div
        className={classNames(
          'invisible absolute rounded shadow-lg py-1 px-2 right-0 w-full -mt-8 flex justify-center items-center text-center',
          className,
          {
            'bg-white text-black': variant === 'light',
            'bg-black text-white': variant === 'dark',
            'group-hover:visible group-hover:z-50': !disabled,
          },
        )}
      >
        {content}
      </div>
      {children}
    </div>
  );
};

export default Tooltip;
