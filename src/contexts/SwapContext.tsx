import {
  IConfirmationTxDescription,
  OnTransaction,
  SwapMode,
  SwapResult,
} from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { BONK_MINT, WRAPPED_SOL_MINT } from 'src/constants';
import { toLamports } from 'src/misc/utils';
import { FormProps, IInit } from 'src/types';
import { useAccounts } from './accounts';
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
  onSubmit: () => Promise<SwapResult | null>;
  lastSwapResult: SwapResult | null;
  formProps: FormProps;
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
}

export const initialSwapContext: ISwapContext = {
  form: {
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
  },
  setForm() { },
  errors: {},
  setErrors() { },
  fromTokenInfo: undefined,
  toTokenInfo: undefined,
  onSubmit: async () => null,
  lastSwapResult: null,
  displayMode: 'modal',
  formProps: {
    swapMode: SwapMode.ExactIn,
    initialAmount: undefined,
    fixedAmount: undefined,
    initialInputMint: undefined,
    fixedInputMint: undefined,
    initialOutputMint: undefined,
    fixedOutputMint: undefined,
  },
  scriptDomain: '',
  swapping: {
    totalTxs: 0,
    txStatus: [],
  },
  reset() { },
};

export const SwapContext = createContext<ISwapContext>(initialSwapContext);

export function useSwapContext(): ISwapContext {
  return useContext(SwapContext);
}

export const PRIORITY_NONE = 0; // No additional fee
export const PRIORITY_HIGH = 0.000_005; // Additional fee of 1x base fee
export const PRIORITY_TURBO = 0.000_5; // Additional fee of 100x base fee
export const PRIORITY_MAXIMUM_SUGGESTED = 0.01;

export const SwapContextProvider: FC<{
  displayMode: IInit['displayMode'];
  scriptDomain?: string;
  asLegacyTransaction: boolean;
  setAsLegacyTransaction: React.Dispatch<React.SetStateAction<boolean>>;
  formProps?: FormProps;
  children: ReactNode;
}> = (props) => {
  const {
    displayMode,
    scriptDomain,
    formProps: originalFormProps,
    children,
  } = props;

  const { tokenMap } = useTokenContext();
  const { wallet } = useWalletPassThrough();
  const { refresh: refreshAccount } = useAccounts();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const formProps: FormProps = useMemo(() => ({ ...initialSwapContext.formProps, ...originalFormProps }), [originalFormProps])

  const [form, setForm] = useState<IForm>({
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: BONK_MINT.toString(),
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

  const nativeAmount = useMemo(() => {
    if (!form.fromValue || !fromTokenInfo) return JSBI.BigInt(0);
      return toLamports(Number(form.fromValue), Number(fromTokenInfo.decimals));
  }, [form.fromValue, form.fromMint, fromTokenInfo, form.toValue, form.toMint, toTokenInfo]);

  const amount = JSBI.BigInt(nativeAmount)
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
    if (!walletPublicKey || !wallet?.adapter) {
      return null;
    }

    try {
      // TODO: 
      return null;
    } catch (error) {
      console.log('Swap error', error);
      return null;
    }
  }, [walletPublicKey]);

  const refreshAll = () => {
    refreshAccount();
  };

  const reset = useCallback(({ resetValues } = { resetValues: true }) => {
    setTimeout(() => {
      if (resetValues) {
        setForm({ ...initialSwapContext.form, ...formProps });
      }

      setErrors(initialSwapContext.errors);
      setLastSwapResult(initialSwapContext.lastSwapResult);
      setTxStatus(initialSwapContext.swapping.txStatus);
      setTotalTxs(initialSwapContext.swapping.totalTxs);
      refreshAccount();
    }, 0)
  }, []);

  const [priorityFeeInSOL, setPriorityFeeInSOL] = useState<number>(PRIORITY_NONE);
  const computeUnitPriceMicroLamports = useMemo(() => {
    if (priorityFeeInSOL === undefined) return 0;
    return new Decimal(priorityFeeInSOL)
      .mul(10 ** 9) // sol into lamports
      .mul(10 ** 6) // lamports into microlamports
      .div(1_400_000) // divide by CU
      .round()
      .toNumber();
  }, [priorityFeeInSOL]);

  return (
    <SwapContext.Provider
      value={{
        form,
        setForm,
        errors,
        setErrors,
        fromTokenInfo,
        toTokenInfo,
        onSubmit,
        lastSwapResult,
        reset,

        displayMode,
        formProps,
        scriptDomain,
        swapping: {
          totalTxs,
          txStatus,
        },
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};
