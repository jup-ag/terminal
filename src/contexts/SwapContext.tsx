import {
  IConfirmationTxDescription,
  OnTransaction,
  RouteInfo,
  SwapMode,
  SwapResult,
  useJupiter,
} from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import JSBI from 'jsbi';
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { fromLamports, toLamports } from 'src/misc/utils';
import { IInit } from 'src/types';
import { useAccounts } from './accounts';
import { useSlippageConfig } from './SlippageConfigProvider';
import { useTokenContext } from './TokenContextProvider';
import { useWalletPassThrough } from './WalletPassthroughProvider';

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
  setErrors: Dispatch<
    SetStateAction<
      Record<
        string,
        {
          title: string;
          message: string;
        }
      >
    >
  >;
  fromTokenInfo?: TokenInfo | null;
  toTokenInfo?: TokenInfo | null;
  selectedSwapRoute: RouteInfo | null;
  setSelectedSwapRoute: Dispatch<SetStateAction<RouteInfo | null>>;
  onSubmit: () => Promise<SwapResult | null>;
  lastSwapResult: SwapResult | null;
  mode: IInit['mode'];
  swapMode?: IInit['swapMode'];
  // amount: IInit['amount'];
  fixedAmount: IInit['fixedAmount'];
  // inputMint?: IInit['inputMint'];
  fixedInputMint?: IInit['fixedInputMint'];
  // outputMint?: IInit['outputMint'];
  fixedOutputMint?: IInit['fixedOutputMint'];
  displayMode: IInit['displayMode'];
  scriptDomain: IInit['scriptDomain'];
  swapping: {
    totalTxs: number;
    txStatus: Array<{
      txid: string;
      txDescription: IConfirmationTxDescription;
      status: 'loading' | 'fail' | 'success';
    }>;
  };
  reset: (props?: { resetValues: boolean }) => void;
  jupiter: Omit<ReturnType<typeof useJupiter>, 'exchange'> & {
    exchange: ReturnType<typeof useJupiter>['exchange'] | undefined;
  };
}

export const initialSwapContext: ISwapContext = {
  form: {
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
  },
  setForm() {},
  errors: {},
  setErrors() {},
  fromTokenInfo: undefined,
  toTokenInfo: undefined,
  selectedSwapRoute: null,
  setSelectedSwapRoute() {},
  onSubmit: async () => null,
  lastSwapResult: null,
  mode: 'default',
  swapMode: undefined,
  displayMode: 'modal',
  // amount: undefined,
  fixedAmount: undefined,
  // inputMint: undefined,
  fixedInputMint: undefined,
  // outputMint: undefined,
  fixedOutputMint: undefined,
  scriptDomain: '',
  swapping: {
    totalTxs: 0,
    txStatus: [],
  },
  reset() {},
  jupiter: {
    routes: [],
    allTokenMints: [],
    routeMap: new Map(),
    exchange: undefined,
    loading: false,
    refresh() {},
    lastRefreshTimestamp: 0,
    error: undefined,
  },
};

export const SwapContext = createContext<ISwapContext>(initialSwapContext);

export function useSwapContext(): ISwapContext {
  return useContext(SwapContext);
}

export const SwapContextProvider: FC<{
  displayMode: IInit['displayMode'];
  mode: IInit['mode'];
  swapMode: IInit['swapMode'];
  amount: IInit['amount'];
  fixedAmount: IInit['fixedAmount'];
  inputMint: IInit['inputMint'];
  fixedInputMint: IInit['fixedInputMint'];
  outputMint: IInit['outputMint'];
  fixedOutputMint: IInit['fixedOutputMint'];
  scriptDomain?: string;
  children: ReactNode;
}> = ({
  displayMode,
  mode,
  swapMode,
  amount,
  fixedAmount,
  inputMint,
  fixedInputMint,
  outputMint,
  fixedOutputMint,
  scriptDomain,
  children,
}) => {
  const { tokenMap } = useTokenContext();
  const { wallet } = useWalletPassThrough();
  const { refresh: refreshAccount } = useAccounts();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const [form, setForm] = useState<IForm>({
    fromMint: inputMint ?? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: outputMint ?? WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
  });
  const [errors, setErrors] = useState<Record<string, { title: string; message: string }>>({});

  const fromTokenInfo = useMemo(() => {
    const tokenInfo = form.fromMint ? tokenMap.get(form.fromMint) : null;
    return tokenInfo;
  }, [form.fromMint, tokenMap]);

  const toTokenInfo = useMemo(() => {
    const tokenInfo = form.toMint ? tokenMap.get(form.toMint) : null;
    return tokenInfo;
  }, [form.toMint, tokenMap]);

  // Set value given initial amount
  useEffect(() => {
    if (!amount) return;

    // What if outputMint/inputMint is not specified? We don't end up grabbing the default here
    const mint = swapMode === SwapMode.ExactOut ? outputMint : inputMint;
    const tokenInfo = mint ? tokenMap.get(mint) : undefined;
    const uiAmount = String(fromLamports(JSBI.BigInt(amount), tokenInfo?.decimals || 0));
    if (swapMode === SwapMode.ExactOut) {
      setForm((prev) => ({ ...prev, toValue: uiAmount }));
    } else {
      setForm((prev) => ({ ...prev, fromValue: uiAmount }));
    }
  }, [amount, fixedAmount, swapMode, inputMint, outputMint, tokenMap]);

  const nativeAmount = useMemo(() => {
    if (swapMode === SwapMode.ExactOut) {
      if (!form.toValue || !toTokenInfo) return JSBI.BigInt(0);
      console.log('form.toValue', form.toValue, 'toTokenInfo', toTokenInfo);
      return toLamports(Number(form.toValue), Number(toTokenInfo.decimals));
    } else {
      if (!form.fromValue || !fromTokenInfo) return JSBI.BigInt(0);
      return toLamports(Number(form.fromValue), Number(fromTokenInfo.decimals));
    }
  }, [form.fromValue, form.fromMint, fromTokenInfo, form.toValue, form.toMint, toTokenInfo, swapMode]);

  const { slippage } = useSlippageConfig();

  const jupiterSwapMode = swapMode ? SwapMode[swapMode] : SwapMode.ExactIn;
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
    amount: JSBI.BigInt(nativeAmount),
    inputMint: useMemo(() => new PublicKey(form.fromMint), [form.fromMint]),
    outputMint: useMemo(() => new PublicKey(form.toMint), [form.toMint]),
    slippage,
    swapMode: jupiterSwapMode,
    // TODO: Support dynamic single tx
    enforceSingleTx: false,
  });

  // Refresh on slippage change
  useEffect(() => refresh(), [slippage]);

  const [selectedSwapRoute, setSelectedSwapRoute] = useState<RouteInfo | null>(null);
  useEffect(() => {
    const found = swapRoutes?.find((item) => JSBI.GT(item.outAmount, 0)); // TODO: Is this necessary?
    if (found) {
      setSelectedSwapRoute(found);
    } else {
      setSelectedSwapRoute(null);
    }
  }, [swapRoutes]);

  useEffect(() => {
    setForm((prev) => {
      const newValue = { ...prev };

      console.log('jupiterSwapMode', jupiterSwapMode);
      if (jupiterSwapMode === SwapMode.ExactIn) {
        newValue.toValue = selectedSwapRoute?.outAmount
          ? String(fromLamports(selectedSwapRoute?.outAmount, toTokenInfo?.decimals || 0))
          : '';
      } else {
        console.log('update toValue');
        newValue.fromValue = selectedSwapRoute?.inAmount
          ? String(fromLamports(selectedSwapRoute?.inAmount, fromTokenInfo?.decimals || 0))
          : '';
      }
      return newValue;
    });
  }, [selectedSwapRoute, fromTokenInfo, toTokenInfo, jupiterSwapMode]);

  const [totalTxs, setTotalTxs] = useState(0);
  const [txStatus, setTxStatus] = useState<
    Array<{
      txid: string;
      txDescription: IConfirmationTxDescription;
      status: 'loading' | 'fail' | 'success';
    }>
  >([]);

  const onTransaction: OnTransaction = async (txid, totalTxs, txDescription, awaiter) => {
    setTotalTxs(totalTxs);

    const tx = txStatus.find((tx) => tx.txid === txid);
    if (!tx) {
      setTxStatus((prev) => [...prev, { txid, txDescription, status: 'loading' }]);
    }

    const success = !((await awaiter) instanceof Error);

    setTxStatus((prev) => {
      const tx = prev.find((tx) => tx.txid === txid);
      if (tx) {
        tx.status = success ? 'success' : 'fail';
      }
      return [...prev];
    });
  };

  const [lastSwapResult, setLastSwapResult] = useState<SwapResult | null>(null);
  const onSubmit = useCallback(async () => {
    if (!walletPublicKey || !wallet?.adapter || !selectedSwapRoute) {
      return null;
    }

    try {
      const swapResult = await exchange({
        wallet: wallet?.adapter as SignerWalletAdapter,
        routeInfo: selectedSwapRoute,
        onTransaction,
      });

      setLastSwapResult(swapResult);
      return swapResult;
    } catch (error) {
      console.log('Swap error', error);
      return null;
    }
  }, [walletPublicKey, selectedSwapRoute]);

  const refreshAll = () => {
    refresh();
    refreshAccount();
  };

  const reset = useCallback(({ resetValues } = { resetValues: true }) => {
    if (resetValues) {
      setForm(initialSwapContext.form);
    }

    setSelectedSwapRoute(null);
    setErrors(initialSwapContext.errors);
    setLastSwapResult(initialSwapContext.lastSwapResult);
    setTxStatus(initialSwapContext.swapping.txStatus);
    setTotalTxs(initialSwapContext.swapping.totalTxs);
    refreshAccount();
  }, []);

  return (
    <SwapContext.Provider
      value={{
        form,
        setForm,
        errors,
        setErrors,
        fromTokenInfo,
        toTokenInfo,
        selectedSwapRoute,
        setSelectedSwapRoute,
        onSubmit,
        lastSwapResult,
        reset,
        mode,
        swapMode,
        displayMode,
        fixedAmount,
        fixedInputMint,
        fixedOutputMint,
        scriptDomain,
        swapping: {
          totalTxs,
          txStatus,
        },
        jupiter: {
          routes: swapRoutes,
          allTokenMints,
          routeMap,
          exchange,
          loading: loadingQuotes,
          refresh: refreshAll,
          lastRefreshTimestamp,
          error,
        },
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};
