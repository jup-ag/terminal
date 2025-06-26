import { Placement, PositioningStrategy } from '@popperjs/core';
import React from 'react';
import Popover from '../Popover/Popover';
import { cn } from 'src/misc/cn';

interface TooltipProps {
  content: string | React.ReactNode;
  disabled?: boolean;
  placement?: Placement;
  offset?: [number, number];
  variant?: 'dark' | 'light';
  persistOnClick?: boolean;
  buttonContentClassName?: string;
  contentClassName?: string;
  drawShades?: boolean;
  strategy?: PositioningStrategy;
}

const PopoverTooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
  content,
  disabled = false,
  variant = 'dark',
  children,
  offset,
  placement,
  persistOnClick,
  buttonContentClassName,
  contentClassName,
  drawShades,
  strategy,
}) => {
  return (
    <Popover
      placement={placement || 'top'}
      buttonContent={children}
      buttonContentClassName={buttonContentClassName}
      offset={offset || [0, 2.5]}
      contentClassName={contentClassName}
      drawShades={drawShades}
      popoverContent={
        content && (
          <div
            className={cn('p-2 rounded-lg max-w-[360px] w-full text-xs', {
              'bg-white text-black': variant === 'light',
              'bg-black text-primary-text': variant === 'dark',
              'group-hover:visible group-hover:z-50': !disabled,
            })}
          >
            {content}
          </div>
        )
      }
      id="TooltipPopover"
      trigger={persistOnClick ? 'click' : 'hover'}
      persistOnClick={persistOnClick}
      strategy={strategy}
    ></Popover>
  );
};

export default PopoverTooltip;
