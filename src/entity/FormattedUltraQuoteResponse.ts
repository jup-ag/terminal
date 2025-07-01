import { PublicKey } from '@solana/web3.js';
import JSBI from 'jsbi';
import {
  array,
  boolean,
  coerce,
  defaulted,
  Infer,
  instance,
  nullable,
  number,
  optional,
  string,
  type,
} from 'superstruct';

const PublicKeyFromString = coerce(instance(PublicKey), string(), (value) => new PublicKey(value));

//@ts-ignore bug because JSBI ctor being private?!?
const AmountFromString = coerce<JSBI, null, string>(instance(JSBI), string(), (value) => JSBI.BigInt(value));

const NumberFromString = coerce<string, null, number>(string(), number(), (value) => Number(value));

const SwapInfo = type({
  ammKey: PublicKeyFromString,
  label: string(),
  inputMint: string(),
  outputMint: string(),
  inAmount: AmountFromString,
  outAmount: AmountFromString,
  feeAmount: AmountFromString,
  feeMint: PublicKeyFromString,
});

const RoutePlanStep = type({
  swapInfo: SwapInfo,
  percent: number(),
});
const RoutePlanWithMetadata = array(RoutePlanStep);

export const FormattedUltraQuoteResponse = type({
  inputMint: PublicKeyFromString,
  inAmount: AmountFromString,
  outputMint: PublicKeyFromString,
  outAmount: AmountFromString,
  otherAmountThreshold: AmountFromString,
  priceImpactPct: NumberFromString,
  routePlan: RoutePlanWithMetadata,
  slippageBps: number(),
  contextSlot: defaulted(number(), 0),
  computedAutoSlippage: optional(number()),
  transaction: nullable(string()),
  swapType: string(),
  gasless: boolean(),
  requestId: string(),
  prioritizationFeeLamports: optional(number()),
  feeBps: number(),
  router: string(),
});

export type FormattedUltraQuoteResponse = Infer<typeof FormattedUltraQuoteResponse>;
