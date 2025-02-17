import React, { HTMLAttributes, PropsWithChildren, useEffect, useState } from 'react';
import { cn } from 'src/misc/cn';

const Collapse: React.FC<
  PropsWithChildren<{
    className?: HTMLAttributes<HTMLDivElement>['className'];
    height: string | number;
    maxHeight: string | number;
    expanded: boolean;
  }>
> = ({ children, className = '', height, maxHeight, expanded }) => {
  const [localHeight, setLocalHeight] = useState<string | number>(height);

  useEffect(() => {
    if (expanded) setLocalHeight(maxHeight);
    else setLocalHeight(height);
  }, [height, maxHeight, expanded]);

  const animationClass = expanded ? 'animate-fade-in' : 'animate-fade-out';

  return (
    <div
      className={cn('transition-all duration-200 overflow-hidden', animationClass, className)}
      style={{ height: localHeight, maxHeight }}
    >
      {children}
    </div>
  );
};

export default Collapse;
