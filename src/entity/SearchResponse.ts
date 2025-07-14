export type SearchRequest = {
  query: string;
  sortBy?: 'verified';
  isVerifiedOnly?: boolean;
  isExactSymbol?: boolean;
  isExactCaseSearch?: boolean;
};

export type SwapStats = {
  priceChange?: number | undefined;
  volumeChange?: number | undefined;
  liquidityChange?: number | undefined;
  holderChange?: number | undefined;
  buyVolume?: number | undefined;
  sellVolume?: number | undefined;
  buyOrganicVolume?: number | undefined;
  sellOrganicVolume?: number | undefined;
  numBuys?: number | undefined;
  numSells?: number | undefined;
  numTraders?: number | undefined;
  numOrganicBuyers?: number | undefined;
  numNetBuyers?: number | undefined;
};

export type Asset = {
  id: string;
  updatedAt: string;
  bondingCurve: number | undefined;
  name: string;
  symbol: string;
  icon?: string | undefined;
  decimals: number;
  mintAuthority?: string | undefined;
  freezeAuthority?: string | undefined;
  twitter?: string | undefined;
  telegram?: string | undefined;
  website?: string | undefined;
  dev?: string | undefined;
  circSupply?: number | undefined;
  totalSupply?: number | undefined;
  tokenProgram: string;
  launchpad?: string | undefined;
  graduatedPool?: string | undefined;
  holderCount?: number | undefined;
  fdv?: number | undefined;
  mcap?: number | undefined;
  usdPrice?: number | undefined;
  priceBlockId?: number | undefined;
  liquidity?: number | undefined;
  stats5m?: SwapStats | undefined;
  stats1h?: SwapStats | undefined;
  stats6h?: SwapStats | undefined;
  stats24h?: SwapStats | undefined;
  firstPool?:
    | {
        id: string;
        dex: string;
        createdAt: string;
      }
    | undefined;
  audit?:
    | {
        mintAuthorityDisabled: boolean | undefined;
        freezeAuthorityDisabled: boolean | undefined;
        topHoldersPercentage: number | undefined;
      }
    | undefined;
  organicScore: number;
  organicScoreLabel: 'high' | 'medium' | 'low';
  ctLikes?: number | undefined;
  smartCtLikes?: number | undefined;
  isVerified?: boolean | undefined;
  cexes?: string[] | undefined;
  tags?: string[] | undefined;
};

export type SearchResponse = Asset[];
