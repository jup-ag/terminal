import { TokenInfo } from '@solana/spl-token-registry';
import Image from 'next/image';
import * as React from 'react';
import WarningIcon from 'src/icons/WarningIcon';
import { checkIsUnknownToken } from 'src/misc/tokenTags';

interface ITokenIconProps {
  info: TokenInfo | null | undefined;
  width?: number;
  height?: number;
  enableUnknownTokenWarning?: boolean;
}

function genImageTransformURL(url: string) {
  const qs = new URLSearchParams({
    w: '48',
    h: '48',
    url: (() => {
      if (url.endsWith('/')) return url.slice(0, -1);
      return url;
    })(),
  });

  return `https://wsrv.nl/?${qs.toString()}`;
}
const UnknownTokenImage: React.FC<{
  width: number;
  height: number;
  imageUrl: string;
}> = ({ width, height, imageUrl }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-url={imageUrl}
      data-transformed-url={genImageTransformURL(imageUrl?.toString() || '')}
    >
      <path
        d="M12 0C18.6271 0 24 5.37288 24 12C24 18.6271 18.6269 24 12 24C5.37312 24 0 18.6286 0 12C0 5.37144 5.37216 0 12 0Z"
        fill="#23C1AA"
      />
      <path
        d="M10.79 14.55H12.89V14.355C12.89 13.925 13.01 13.55 13.25 13.23C13.49 12.91 13.765 12.605 14.075 12.315C14.315 12.085 14.545 11.85 14.765 11.61C14.985 11.36 15.165 11.09 15.305 10.8C15.455 10.5 15.53 10.16 15.53 9.78C15.53 9.25 15.395 8.75 15.125 8.28C14.855 7.8 14.45 7.41 13.91 7.11C13.38 6.8 12.725 6.645 11.945 6.645C11.305 6.645 10.725 6.765 10.205 7.005C9.69504 7.245 9.27504 7.575 8.94504 7.995C8.62504 8.415 8.42004 8.905 8.33004 9.465L10.415 9.99C10.475 9.61 10.64 9.31 10.91 9.09C11.19 8.86 11.515 8.745 11.885 8.745C12.315 8.745 12.64 8.85 12.86 9.06C13.09 9.26 13.205 9.52 13.205 9.84C13.205 10.15 13.09 10.425 12.86 10.665C12.63 10.895 12.37 11.155 12.08 11.445C11.77 11.765 11.475 12.14 11.195 12.57C10.925 13 10.79 13.545 10.79 14.205V14.55ZM10.73 18H12.98V15.75H10.73V18Z"
        fill="white"
      />
    </svg>
  );
};

const TokenIcon: React.FunctionComponent<ITokenIconProps> = ({
  info,
  width = 32,
  height = 32,
  enableUnknownTokenWarning = true,
}) => {
  const [transformerHasError, setTransformerHasError] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [info]);

  const imageUrl = React.useMemo(() => {
    try {
      if (!info?.logoURI) return undefined;
      // Locally hosted images on our project
      if (typeof window !== 'undefined' && info?.logoURI?.startsWith('/'))
        return new URL(window.location.origin + info.logoURI);

      return info?.logoURI ? new URL(info.logoURI) : undefined;
    } catch (error) {
      return undefined;
    }
  }, [info?.logoURI]);

  const isUnknown = React.useMemo(() => {
    if (!enableUnknownTokenWarning) return false;
    if (info) {
      return checkIsUnknownToken(info);
    }
  }, [enableUnknownTokenWarning, info]);

  const ImageComp = React.useMemo(() => {
    // If transformerHasError and hasError, render this.
    if (!imageUrl || !info || (hasError && transformerHasError)) {
      return <UnknownTokenImage width={width} height={height} imageUrl={imageUrl?.toString() || ''} />;
    }

    // Then try direct URL
    if (transformerHasError) {
      return (
        // eslint-disable-next-line
        <img
          src={info.logoURI}
          alt={info.symbol}
          width={width}
          height={height}
          style={{ maxWidth: width, maxHeight: height }}
          className={`object-cover rounded-full`}
          onError={() => {
            setHasError(true);
          }}
        />
      );
    }

    // Try free transform image
    return (
      // eslint-disable-next-line
      <img
        src={genImageTransformURL(info.logoURI || '')}
        alt={info.symbol}
        width={width}
        height={height}
        style={{ maxWidth: width, maxHeight: height }}
        className={`object-cover rounded-full`}
        onError={() => {
          setTransformerHasError(true);
        }}
      />
    );
  }, [hasError, height, imageUrl, info, transformerHasError, width]);

  // not in the whitelisted domains, so we just use img tag
  return (
    <span className="relative">
      {ImageComp}
      {isUnknown && (
        <WarningIcon
          width={Math.max(width * 0.6, 16)}
          height={Math.max(height * 0.6, 16)}
          className="absolute -p-1 text-warning -bottom-[2px] -right-[5px]"
        />
      )}
    </span>
  );
};

export default TokenIcon;
