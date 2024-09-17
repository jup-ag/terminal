import { TokenInfo } from '@solana/spl-token-registry';

export const checkIsStrictOrVerified = (tokenInfo: TokenInfo) => {
  return Boolean(
    tokenInfo.tags?.includes('verified') || tokenInfo.tags?.includes('strict') || tokenInfo.tags?.includes('community'),
  );
};

// If it's not VERIFIED, it's unknown
export const checkIsUnknownToken = (tokenInfo: TokenInfo) => {
  return checkIsStrictOrVerified(tokenInfo) === false;
};

export const checkIsToken2022 = (tokenInfo: TokenInfo) => {
  return tokenInfo.tags?.includes('token-2022');
};
