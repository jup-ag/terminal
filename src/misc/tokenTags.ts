import { TokenInfo } from '@solana/spl-token-registry';

export const checkIsStrictOrVerified = (tokenInfo: TokenInfo) => {
  return Boolean(
    tokenInfo.tags?.includes('verified') || tokenInfo.tags?.includes('strict') || tokenInfo.tags?.includes('community'),
  );
};

export const checkIsUnknownToken = (tokenInfo: TokenInfo) => {
  const cleanTags = new Set(tokenInfo.tags);
  // if does not have any of these, mark as unknown
  return !cleanTags.has('community') && !cleanTags.has('lst') && !cleanTags.has('clone');
};

export const checkIsToken2022 = (tokenInfo: TokenInfo) => {
  return tokenInfo.tags?.includes('token-2022');
};
