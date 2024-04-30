import { TokenInfo } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';

export const MINIMUM_SOL_BALANCE = 0.05;

export const ROUTE_CACHE_DURATION = 20_000;

export const PAIR_SELECTOR_TOP_TOKENS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'So11111111111111111111111111111111111111112', // SOL
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', // mSOL
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', // stSOL
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // ETH
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
  'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM', // USDCet
];

export const MAX_INPUT_LIMIT = 100_000_000_000_000;

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const SOL_TOKEN_INFO: TokenInfo = {
  chainId: 101,
  address: 'So11111111111111111111111111111111111111112',
  symbol: 'SOL',
  name: 'Wrapped SOL',
  decimals: 9,
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  tags: ['old-registry'],
  extensions: {
    website: 'https://solana.com/',
    serumV3Usdc: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
    serumV3Usdt: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
    coingeckoId: 'solana',
  },
};
