import { Asset } from 'src/entity/SearchResponse';

export const checkIsStrictOrVerified = (tokenInfo: Asset) => {
  return Boolean(
    tokenInfo.tags?.includes('verified') || tokenInfo.tags?.includes('strict') || tokenInfo.tags?.includes('community'),
  );
};

// If it's not VERIFIED, it's unknown
export const checkIsUnknownToken = (tokenInfo: Asset) => {
  return checkIsStrictOrVerified(tokenInfo) === false;
};

export const checkIsToken2022 = (tokenInfo: Asset) => {
  return tokenInfo.tags?.includes('token-2022');
};
