import JSBI from "jsbi";

export const AGGREGATOR_SOURCES = {
  METIS: 'Metis',
  JUPITERZ: 'JupiterZ',
  HASHFLOW: 'Hashflow',
  DFLOW: 'DFlow',
} as const;

export type AggregatorSources = (typeof AGGREGATOR_SOURCES)[keyof typeof AGGREGATOR_SOURCES];
export interface UltraQuoteResponse {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    priceImpactPct: string;
    routePlan: {
        swapInfo: {
            inputMint: string;
            inAmount: string;
            outputMint: string;
            outAmount: string;
            ammKey: string;
            label: string;
            feeAmount: JSBI;
            feeMint: string;
        };
        percent: number;
    }[];
    contextSlot: number;
    transaction: string | null;
    swapType: 'ultra';
    gasless: boolean;
    requestId: string;
    prioritizationFeeLamports?: number;
    feeBps: number;
    router: AggregatorSources;
  }


export interface UltraSwapQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker?: string;
  swapMode?: 'ExactIn' | 'ExactOut';
}
interface UltraSwapResponseBase {
  signature: string;
  code: number;
  status: 'Success' | 'Failed';
  slot: string;
}

interface UltraSwapResponseSuccess extends UltraSwapResponseBase {
  status: 'Success';
  inputAmountResult: string;
  outputAmountResult: string;
}

interface UltraSwapResponseFailed extends UltraSwapResponseBase {
  status: 'Failed';
  message: string;
  error: string;
}

export type UltraSwapResponse = UltraSwapResponseSuccess | UltraSwapResponseFailed;


export interface Router {
  icon: string;
  id: AggregatorSources;
  name: string;
}

export type RouterResponse = Router[];
interface UltraSwapService {
  getQuote(params: UltraSwapQuoteParams): Promise<UltraQuoteResponse>;
  submitSwap(signedTransaction: string, requestId: string): Promise<UltraSwapResponse>;
}

interface TokenBalance {
  amount: string; // Raw token amount as string
  uiAmount: number; // Formatted amount with decimals
  slot: number; // Solana slot number
  isFrozen: boolean; // Whether the token account is frozen
}

export type BalanceResponse = Record<string, TokenBalance>;
class UltraSwapService implements UltraSwapService {
  private BASE_URL ='https://ultra-api.jup.ag';
  private ROUTE = {
    SWAP: `${this.BASE_URL}/execute`,
    ORDER: `${this.BASE_URL}/order`,
    ROUTERS: `${this.BASE_URL}/order/routers`,
    BALANCES: `${this.BASE_URL}/balances`,
  };

  async getQuote(params: UltraSwapQuoteParams, signal?: AbortSignal): Promise<UltraQuoteResponse> {
    const queryParams = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value.toString(),
          }),
          {},
        ),
    );

    const response = await fetch(`${this.ROUTE.ORDER}?${queryParams.toString()}`, { signal });
    if (!response.ok) {
      throw response;
    }
    const result = await response.json();
    return result;
  }

  async submitSwap(signedTransaction: string, requestId: string): Promise<UltraSwapResponse> {
    const response = await fetch(this.ROUTE.SWAP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransaction, requestId }),
    });
    if (!response.ok) {
      throw response;
    }
    const result = await response.json();
    return result;
  }
  async getRouters(): Promise<RouterResponse> {
    const response = await fetch(this.ROUTE.ROUTERS)
    if (!response.ok) {
      throw response;
    }
    const result = await response.json();
    return result;
  }

  async getBalance(address: string): Promise<BalanceResponse> {
    const response = await fetch(`${this.ROUTE.BALANCES}/${address}`);
    if (!response.ok) {
      throw response;
    }
    const result = await response.json();
    return result;
  }
}

export const ultraSwapService = new UltraSwapService();
