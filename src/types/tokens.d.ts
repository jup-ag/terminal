// eslint-disable-next-line
import type { TokenInfo, TokenExtensions } from '@solana/spl-token-registry';

declare module '@solana/spl-token-registry' {
  interface TokenInfo {
    tags: 'token-2022' | 'jupiter' | 'old-registry' | 'wormhole'[];
    daily_volume?: number | null; // provided by MTS typesense
  }
  interface TokenExtensions {
    isBanned?: boolean;
  }
}
