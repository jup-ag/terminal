import React, { useEffect, useRef } from 'react';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

interface IIdenticonProps {
  address?: string | PublicKey;
  style?: React.CSSProperties;
  className?: string;
}
export const Identicon: React.FC<IIdenticonProps> = (props) => {
  const { style, className } = props;
  const address = typeof props.address === 'string' ? props.address : props.address?.toBase58();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (address && ref.current) {
      ref.current.innerHTML = '';
      ref.current.className = className || '';

      import('jazzicon').then((mod) => {
        const Jazzicon = mod.default as any;

        if (ref && ref.current) {
          const width = style?.width || 16;
          const addressInt = parseInt(bs58.decode(address).toString('hex').slice(5, 15), 16);
          // TODO: Type this
          ref.current.appendChild(new Jazzicon(width, addressInt));
        }
      });
    }
  }, [address]);

  return <div className="identicon-wrapper" ref={ref} style={props.style} />;
};
