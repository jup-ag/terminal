import { TokenInfo } from '@solana/spl-token-registry';

export const checkIsStrictOrVerified = (tokenInfo: TokenInfo) => {
  return Boolean(
    tokenInfo.tags?.includes('verified') || tokenInfo.tags?.includes('strict') || tokenInfo.tags?.includes('community'),
  );
};

export const checkIsUnknownToken = (tokenInfo: TokenInfo) => {
  const cleanTags = new Set(tokenInfo.tags);

  // first one for backwards compatible
  return (
    cleanTags.size === 0 || cleanTags.has('unknown') || (cleanTags.size === 1 && cleanTags.has('pump')) // if token only have ['pump'] tag, and nothing else
  );
};

export const checkIsBannedToken = (tokenInfo: TokenInfo) => {
  return Boolean(tokenInfo.extensions?.isBanned);
};

export const checkIsToken2022 = (tokenInfo: TokenInfo) => {
  return tokenInfo.tags?.includes('token-2022');
};
