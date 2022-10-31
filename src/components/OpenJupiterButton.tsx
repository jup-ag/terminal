import React from 'react';
import Link from 'next/link';

import ExternalIcon from '../icons/ExternalIcon';

const OpenJupiterButton: React.FC<{ href: string }> = ({ href }) => {
  return (
    <Link href={href} target={'_blank'} className="underline cursor-pointer ml-auto mt-2 p-2">
      <div className=" flex items-center space-x-2 text-xs">
        <span>Open Jupiter</span>
        <ExternalIcon />
      </div>
    </Link>
  );
};

export default OpenJupiterButton;
