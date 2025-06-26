import { TokenInfo } from '@solana/spl-token-registry';

const BASE_URL = 'https://fe-api.jup.ag/api/v1/tokens';

// Rename to ApiSearchTokenResponse for the raw API response type
export type ApiSearchTokenResponse = {
  address: string;
  decimals: number;
  freezeAuthority: string | null;
  icon: string;
  mintAuthority: string | null;
  name: string;
  permanentDelegate: string | null;
  symbol: string;
  tags: string[];
  organicScore: number;
  organicScoreLabel: 'high' | 'medium' | 'low';
  volume24h?: number | null;
};

export interface SearchTokenInfo extends TokenInfo {
  organicScore: number;
  organicScoreLabel: 'high' | 'medium' | 'low';
}

type GetSearchTokensResponse = {
  tokens: ApiSearchTokenResponse[];
};

class SearchService {
  private ROUTE = {
    SEARCH: `${BASE_URL}`,
  };

  async search(query: string): Promise<SearchTokenInfo[]> {
    const response = await fetch(`${this.ROUTE.SEARCH}/search?query=${query}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw response;
    }

    const data: GetSearchTokensResponse = await response.json();

    const parsedTokens = data.tokens.map((token) => this.parseTokenInfo(token));
    return parsedTokens;
  }

  async getUserBalanceTokenInfo(tokenAddresses: string[]): Promise<SearchTokenInfo[]> {
    const tokenAddressesString = tokenAddresses.join(',');
    const response = await fetch(`${this.ROUTE.SEARCH}/search?query=${tokenAddressesString}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw response;
    }

    const data: GetSearchTokensResponse = await response.json();
    return data.tokens.map((token) => this.parseTokenInfo(token));
  }

  private parseTokenInfo(token: ApiSearchTokenResponse): SearchTokenInfo {
    return {
      ...token,
      chainId: 101,
      logoURI: token.icon || '',
      // Should parse to use camelCase
      freeze_authority: token.freezeAuthority,
      daily_volume: token.volume24h || undefined,
      mint_authority: token.mintAuthority,
      permanent_delegate: token.permanentDelegate,
      tags: token.tags
    };
  }
}

export const searchService = new SearchService();
