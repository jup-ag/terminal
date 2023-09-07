import { ReactNode } from 'react';
import classNames from 'classnames';

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
      className={classNames(
        'text-transparent bg-clip-text from-[rgba(199,242,132,1))] to-[rgba(0,190,240,1)] bg-200-auto bg-v3-text-gradient',
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
