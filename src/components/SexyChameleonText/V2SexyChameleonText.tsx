import { ReactNode } from 'react';
import { cn } from 'src/misc/cn';

const V2SexyChameleonText = ({
  children,
  className,
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) => {
  return (
    <span
      className={cn(
        'text-transparent bg-clip-text from-[rgba(199,242,132,1)] to-[rgba(0,190,240,1)] bg-v3-text-gradient',
        className,
        {
          'animate-hue': animate,
        },
      )}
    >
      {children}
    </span>
  );
};

export default V2SexyChameleonText;
