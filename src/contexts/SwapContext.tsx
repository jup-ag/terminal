import { RouteInfo, SwapMode, SwapResult, useJupiter } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import JSBI from 'jsbi';
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { fromLamports, toLamports } from 'src/misc/utils';
import { useTokenContext } from './TokenContextProvider';

export interface IForm {
  fromMint: string;
  toMint: string;
  fromValue: string;
  toValue: string;
}

export interface ISwapContext {
  form: IForm;
  setForm: Dispatch<SetStateAction<IForm>>;
  errors: Record<string, { title: string; message: string }>;
  setErrors: Dispatch<SetStateAction<Record<string, {
    title: string;
    message: string;
  }>>>;
  fromTokenInfo?: TokenInfo | null;
  toTokenInfo?: TokenInfo | null;
  outputRoute: RouteInfo | undefined;
  onSubmit: () => Promise<SwapResult | null>;
  lastSwapResult: SwapResult | null;
  reset: () => void,
  jupiter: Omit<ReturnType<typeof useJupiter>, 'exchange'> & { exchange: ReturnType<typeof useJupiter>['exchange'] | undefined };
}

export const initialSwapContext = {
  form: {
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: '',
    fromValue: '',
    toValue: '',
  },
  setForm() { },
  errors: {},
  setErrors() { },
  fromTokenInfo: undefined,
  toTokenInfo: undefined,
  outputRoute: undefined,
  onSubmit: async () => null,
  lastSwapResult: null,
  reset() { },
  jupiter: {
    routes: [],
    allTokenMints: [],
    routeMap: new Map(),
    exchange: undefined,
    loading: false,
    refresh() { },
    lastRefreshTimestamp: 0,
    error: undefined,
  },
}

export const SwapContext = createContext<ISwapContext>(initialSwapContext);

export function useSwapContext(): ISwapContext {
  return useContext(SwapContext);
}

export const SwapContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { tokenMap } = useTokenContext()
  const { wallet } = useWallet();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  const [form, setForm] = useState<IForm>({
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
  });
  const [errors, setErrors] = useState<
    Record<string, { title: string; message: string }>
  >({});

  const fromTokenInfo = useMemo(() => {
    const tokenInfo = form.fromMint
      ? tokenMap.get(form.fromMint)
      : null;
    return tokenInfo;
  }, [form.fromMint, tokenMap]);

  const toTokenInfo = useMemo(() => {
    const tokenInfo = form.toMint
      ? tokenMap.get(form.toMint)
      : null;
    return tokenInfo;
  }, [form.toMint, tokenMap]);

  const amountInLamports = useMemo(() => {
    if (!form.fromValue || !fromTokenInfo) return JSBI.BigInt(0);

    return toLamports(Number(form.fromValue), Number(fromTokenInfo.decimals));
  }, [form.fromValue, form.fromMint, fromTokenInfo]);

  const {
    routes: swapRoutes,
    allTokenMints,
    routeMap,
    exchange,
    loading: loadingQuotes,
    refresh,
    lastRefreshTimestamp,
    error,
  } = useJupiter({
    amount: JSBI.BigInt(amountInLamports),
    inputMint: useMemo(() => new PublicKey(form.fromMint), [
      form.fromMint,
    ]),
    outputMint: useMemo(() => new PublicKey(form.toMint), [form.toMint]),
    // TODO: Show slippage on UI, and support dynamic slippage
    slippage: Number(0.1),
    swapMode: SwapMode.ExactIn,
    // TODO: Support dynamic single tx
    enforceSingleTx: false,
  });

  const outputRoute = useMemo(
    () => swapRoutes?.find((item) => JSBI.GT(item.outAmount, 0)),
    [swapRoutes],
  );
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      toValue: outputRoute?.outAmount
        ? String(
          fromLamports(outputRoute?.outAmount, toTokenInfo?.decimals || 0),
        )
        : '',
    }));
  }, [outputRoute]);

  const onTransaction = async (
    txid: any,
    totalTxs: any,
    txDescription: any,
    awaiter: any,
  ) => {
    console.log({ txid, totalTxs, txDescription, awaiter });
  };

  const [lastSwapResult, setLastSwapResult] = useState<SwapResult | null>(null);
  const onSubmit = useCallback(async () => {
    console.log({ walletPublicKey, adapter: wallet, outputRoute })
    if (!walletPublicKey || !wallet?.adapter || !outputRoute) {
      return null;
    }

    try {
      const swapResult = await exchange({
        wallet: wallet?.adapter as SignerWalletAdapter,
        routeInfo: outputRoute,
        onTransaction,
      });

      setLastSwapResult(swapResult)
      return swapResult;
    } catch (error) {
      console.log('Swap error', error);
      return null;
    }
  }, [walletPublicKey, outputRoute]);

  const reset = useCallback(() => {
    setForm(initialSwapContext.form);
    setErrors(initialSwapContext.errors);
    setLastSwapResult(initialSwapContext.lastSwapResult);
  }, [])

  return (
    <SwapContext.Provider value={{
      form,
      setForm,
      errors,
      setErrors,
      fromTokenInfo,
      toTokenInfo,
      outputRoute,
      onSubmit,
      lastSwapResult,
      reset,
      jupiter: {
        routes: swapRoutes,
        allTokenMints,
        routeMap,
        exchange,
        loading: loadingQuotes,
        refresh,
        lastRefreshTimestamp,
        error,
      }
    }}>
      {children}
    </SwapContext.Provider>
  );
};
