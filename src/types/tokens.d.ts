// eslint-disable-next-line
import type { TokenInfo, TokenExtensions } from '@solana/spl-token-registry';

declare module '@solana/spl-token-registry' {
  interface TokenInfo {
    tags: (
      | 'token-2022'
      | 'verified'
      | 'stablecoin'
      | 'pump'
      | 'birdeye-trending'
      | 'community'
      | 'strict'
      | 'perps'
      | 'new'
      | 'lp-token'
      | 'wrapped-sollet'
      | 'ethereum'
      | 'fabric'
      | 'synthetics'
      | 'lst'
    )[];
    freeze_authority?: string | null;
    mint_authority?: string | null;
    permanent_delegate?: string | null;
    daily_volume?: number | null; // provided by MTS
  }
  interface TokenExtensions {
    isBanned?: boolean;
  }
}
