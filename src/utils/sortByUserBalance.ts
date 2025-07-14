import Decimal from 'decimal.js';
import { Asset } from 'src/entity/SearchResponse';
import { checkIsUnknownToken } from 'src/misc/tokenTags';

interface BalanceData {
  [mint: string]: {
    uiAmount: number;
  };
}

interface SortByUserBalanceOptions {
  balances?: BalanceData;
  prioritizeUserTokens?: boolean;
  prioritizeKnownTokens?: boolean;
}

/**
 * Sorts search results based on user balance and other criteria
 * @param searchResults - Array of search assets to sort
 * @param options - Sorting options including balances and preferences
 * @returns Sorted array of search assets
 * 
 * @example
 * // Basic usage with user balances
 * const sortedResults = sortByUserBalance(searchResults, {
 *   balances: userBalances,
 *   prioritizeUserTokens: true,
 *   prioritizeKnownTokens: true
 * });
 * 
 * @example
 * // Sort without prioritizing user tokens
 * const sortedResults = sortByUserBalance(searchResults, {
 *   balances: userBalances,
 *   prioritizeUserTokens: false
 * });
 */
export const sortByUserBalance = (
  searchResults: Asset[],
  options: SortByUserBalanceOptions = {}
): Asset[] => {
  const { balances = {}, prioritizeUserTokens = true, prioritizeKnownTokens = true } = options;

  // Create maps for efficient lookups
  const userBalanceMap = new Map<string, number>();
  const userUsdValueMap = new Map<string, Decimal>();

  // Calculate user balances and USD values
  Object.entries(balances)
    .filter(([_, item]) => item.uiAmount > 0)
    .forEach(([mint, item]) => {
      const tokenInfo = searchResults.find((token) => token.id === mint);
      if (!tokenInfo) return;

      const amount = item.uiAmount;
      userBalanceMap.set(mint, amount);

      const tokenPrice = tokenInfo.usdPrice || 0;
      if (tokenPrice) {
        const usdValue = new Decimal(amount).mul(tokenPrice);
        if (usdValue.greaterThan(0)) {
          userUsdValueMap.set(mint, usdValue);
        }
      }
    });

  // Deduplicate tokens by ID
  const deduplicatedResults = (() => {
    const map = new Map<string, Asset>();
    searchResults.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  })();

  return deduplicatedResults.sort((t1, t2) => {
    // 1. USD value comparison (highest first)
    const t1UsdValue = userUsdValueMap.get(t1.id);
    const t2UsdValue = userUsdValueMap.get(t2.id);
    
    if (t1UsdValue && t2UsdValue) {
      const usdComparison = t2UsdValue.cmp(t1UsdValue);
      if (usdComparison !== 0) return usdComparison;
    } else if (t1UsdValue && !t2UsdValue) {
      return -1; // t1 has USD value, t2 doesn't
    } else if (!t1UsdValue && t2UsdValue) {
      return 1; // t2 has USD value, t1 doesn't
    }

    // 2. Balance comparison (highest first)
    const t1Balance = userBalanceMap.get(t1.id);
    const t2Balance = userBalanceMap.get(t2.id);
    
    if (t1Balance && t2Balance) {
      const balanceComparison = new Decimal(t2Balance).cmp(t1Balance);
      if (balanceComparison !== 0) return balanceComparison;
    } else if (t1Balance && !t2Balance) {
      return -1; // t1 has balance, t2 doesn't
    } else if (!t1Balance && t2Balance) {
      return 1; // t2 has balance, t1 doesn't
    }

    // 3. User token prioritization
    if (prioritizeUserTokens) {
      const t1HasBalance = userBalanceMap.has(t1.id);
      const t2HasBalance = userBalanceMap.has(t2.id);
      
      if (t1HasBalance && !t2HasBalance) return -1;
      if (!t1HasBalance && t2HasBalance) return 1;
    }

    // 4. Volume-based scoring
    let t1Score = 0;
    let t2Score = 0;
    
    const t1Volume = (t1.stats24h?.buyVolume || 0) + (t1.stats24h?.sellVolume || 0);
    const t2Volume = (t2.stats24h?.buyVolume || 0) + (t2.stats24h?.sellVolume || 0);

    // Higher volume gets higher score
    if (t1Volume > t2Volume) t1Score += 1;
    if (t2Volume > t1Volume) t2Score += 1;

    // 5. Known token prioritization
    if (prioritizeKnownTokens) {
      if (checkIsUnknownToken(t1)) t1Score -= 2;
      if (checkIsUnknownToken(t2)) t2Score -= 2;
    }

    return t2Score - t1Score;
  });
};

/**
 * Creates a sorted search result with user tokens prioritized
 * @param searchResults - Array of search assets
 * @param balances - User balance data
 * @returns Sorted array with user tokens at the top
 * 
 * @example
 * // Simple usage - automatically prioritizes user tokens and known tokens
 * const sortedResults = createSortedSearchResult(searchResults, userBalances);
 */
export const createSortedSearchResult = (
  searchResults: Asset[],
  balances?: BalanceData
): Asset[] => {
  return sortByUserBalance(searchResults, {
    balances,
    prioritizeUserTokens: true,
    prioritizeKnownTokens: true,
  });
}; 