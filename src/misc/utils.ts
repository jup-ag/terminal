import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import { RefObject, useEffect, useRef, useState } from 'react';
import { BalanceResponse } from 'src/data/UltraSwapService';
import { Asset } from 'src/entity/SearchResponse';
import { checkIsUnknownToken } from './tokenTags';

const userLocale =
  typeof window !== 'undefined'
    ? navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language
    : 'en-US';

export const numberFormatter = new Intl.NumberFormat(userLocale, {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 9,
});

const getDecimalCount = (value: string) => {
  const parts = value.split('.');
  return parts.length > 1 ? parts[1].length : 0;
};

export const formatNumber = {
  format: (val?: string | Decimal, precision?: number): string => {
    if (!val) {
      return '';
    }

    // Use the default precision if not provided
    const defaultDecimals = getDecimalCount(val.toString());
    // format it against user locale
    const numberFormatter = new Intl.NumberFormat(userLocale, {
      maximumFractionDigits: precision ?? defaultDecimals,
    });
    return numberFormatter.format(val.toString());
  },
};

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function readableValue(lamportsAmount: JSBI | BN | number | bigint, decimals: number): string {
  return new Decimal(lamportsAmount.toString())
    .div(10 ** decimals)
    .toDP(decimals, Decimal.ROUND_DOWN)
    .toFixed();
}

export function fromLamports(lamportsAmount: JSBI | BN | number | bigint, decimals: number): number {
  return new Decimal(lamportsAmount.toString())
    .div(10 ** decimals)
    .toDP(decimals, Decimal.ROUND_DOWN)
    .toNumber();
}

export function toLamports(lamportsAmount: JSBI | BN | number, decimals: number): number {
  return new Decimal(lamportsAmount.toString())
    .mul(10 ** decimals)
    .floor()
    .toNumber();
}

// https://usehooks.com/useEventListener/
export function useReactiveEventListener(
  eventName: string,
  handler: (event: any) => void,
  element = typeof window !== 'undefined' ? window : null,
) {
  // Create a ref that stores handler
  const savedHandler = useRef<React.Ref<any>>();
  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect(
    () => {
      if (typeof window !== 'undefined') {
        // Make sure element supports addEventListener
        // On
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;
        // Create event listener that calls handler function stored in ref
        const eventListener = (event: any) => typeof savedHandler.current === 'function' && savedHandler.current(event);
        // Add event listener
        element.addEventListener(eventName, eventListener);
        // Remove event listener on cleanup
        return () => {
          element.removeEventListener(eventName, eventListener);
        };
      }
    },
    [eventName, element], // Re-run if eventName or element changes
  );
}

export const isMobile = () => typeof window !== 'undefined' && screen && screen.width <= 480;

export const detectedSeparator = formatNumber.format('1.1').substring(1, 2);

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export function useOutsideClick(ref: RefObject<HTMLElement>, handler: (e: MouseEvent) => void) {
  useEffect(() => {
    const listener = (event: any) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mouseup', listener);
    return () => {
      document.removeEventListener('mouseup', listener);
    };
  }, [ref, handler]);
}

export function splitIntoChunks<T>(array: T[], size: number): T[][] {
  return Array.apply<number, T[], T[][]>(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
    array.slice(index * size, (index + 1) * size),
  );
}

export const hasNumericValue = (amount: string | number) => {
  if (amount && !Number.isNaN(Number(amount))) {
    return true;
  }
  return false;
};

export function jsonToBase64(object: Object) {
  try {
    const json = JSON.stringify(object);
    return Buffer.from(json).toString('base64');
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function base64ToJson(base64String: string) {
  try {
    const json = Buffer.from(base64String, 'base64').toString();
    return JSON.parse(json);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function isValidSolanaAddress(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    console.error('Invalid Solana address:', error);
    return false;
  }
}


/**
 * Sorts search results based on user balance and other criteria
 * @param searchResults - Array of search assets to sort
 * @param options - Sorting options including balances and preferences
 * @returns Sorted array of search assets
 */
export const sortByUserBalance = (
  searchResults: Asset[],
  balances: BalanceResponse,  
): Asset[] => {

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
    const t1HasBalance = userBalanceMap.has(t1.id);
    const t2HasBalance = userBalanceMap.has(t2.id);
    
    if (t1HasBalance && !t2HasBalance) return -1;
    if (!t1HasBalance && t2HasBalance) return 1;

    // 4. Volume-based scoring
    let t1Score = 0;
    let t2Score = 0;
    
    const t1Volume = (t1.stats24h?.buyVolume || 0) + (t1.stats24h?.sellVolume || 0);
    const t2Volume = (t2.stats24h?.buyVolume || 0) + (t2.stats24h?.sellVolume || 0);

    // Higher volume gets higher score
    if (t1Volume > t2Volume) t1Score += 1;
    if (t2Volume > t1Volume) t2Score += 1;

    // 5. Known token prioritization
    if (checkIsUnknownToken(t1)) t1Score -= 2;
    if (checkIsUnknownToken(t2)) t2Score -= 2;

    return t2Score - t1Score;
  });
};