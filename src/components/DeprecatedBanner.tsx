import Link from 'next/link';
import React from 'react';
import { cn } from 'src/misc/cn';

const DeprecatedBanner: React.FC = () => {

  return (
    <div
      className={cn(
        'w-full px-4 py-3 ',
        'flex items-center justify-center text-center',
        'font-medium text-sm',
        'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      )}
    >
      <div className="flex items-center space-x-2  flex-row">
        <span>
        Jupiter Terminal is deprecated and rebranded as{' '}
          <Link href="https://plugin.jup.ag" target="_blank" className="underline">
            Jupiter Plugin
          </Link>
          , please migrate for the latest update.
        </span>
      </div>
    </div>
  );
};

export default DeprecatedBanner;
