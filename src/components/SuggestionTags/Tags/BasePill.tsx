import React, { PropsWithChildren } from 'react';
import { cn } from 'src/misc/cn';

export const HAPPY_CLASS = 'text-v2-primary bg-v2-primary/5 border border-v2-primary/5';
export const SUGGESTION_CLASS = 'text-v2-lily bg-v2-lily/5 border border-v2-lily/5';
export const WARNING_CLASS = 'text-text-warning-primary bg-utility-warning-50 border border-utility-warning-300';
export const DANGER_CLASS = 'text-utility-error-700 bg-utility-error-50 border border-utility-error-200';

const BasePill: React.FC<PropsWithChildren & { className: HTMLDivElement['className'] }> = (props) => {
  return (
    <div
      className={cn(
        'py-1.5 px-2',
        'flex items-center gap-x-1.5',
        'select-none transition-all fill-current',
        'rounded-md !text-xxs font-[500] !leading-none whitespace-nowrap',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
};

export default BasePill;
