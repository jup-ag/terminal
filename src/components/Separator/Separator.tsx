import React from 'react';
import { cn } from 'src/misc/cn';

interface Props {
  className?: string;
}

const Separator = ({ className }: Props) => {
  return <div className={cn('my-5 border-t-[1px] border-black-10 dark:border-white-10', className)} />;
};

export default Separator;
