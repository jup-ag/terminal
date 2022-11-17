import { ReactNode } from 'react';

const SexyChameleonText = ({ children, className }: { children: ReactNode; className?: string }) => {
  const baseClass =
    'text-transparent bg-clip-text bg-gradient-to-r from-[rgba(252,192,10,1)] to-[rgba(78,186,233,1)] dark:bg-200-auto dark:bg-jupiter-gradient-alternative animate-hue dark:animate-shine';
  const classes = [baseClass, className].join(' ');
  return <span className={classes}>{children}</span>;
};

export default SexyChameleonText;
