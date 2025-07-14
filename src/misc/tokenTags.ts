import { SearchAsset } from 'src/entity/SearchResponse';

export const checkIsStrictOrVerified = (tokenInfo: SearchAsset) => {
  return Boolean(
    tokenInfo.tags?.includes('verified') || tokenInfo.tags?.includes('strict') || tokenInfo.tags?.includes('community'),
  );
};

// If it's not VERIFIED, it's unknown
export const checkIsUnknownToken = (tokenInfo: SearchAsset) => {
  return checkIsStrictOrVerified(tokenInfo) === false;
};

export const checkIsToken2022 = (tokenInfo: SearchAsset) => {
  return tokenInfo.tags?.includes('token-2022');
};
