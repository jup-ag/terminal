import { SwapResult } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import {  hasNumericValue, useDebounce } from 'src/misc/utils';
import { FormProps, IInit } from 'src/types';
import { useScreenState } from './ScreenProvider';
import { useTokenContext } from './TokenContextProvider';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import { useAccounts } from './accounts';
import { useQuoteQuery } from 'src/queries/useQuoteQuery';
import { UltraQuoteResponse } from 'src/data/UltraSwapService';
import { FormattedUltraQuoteResponse } from 'src/entity/FormattedUltraQuoteResponse';
import { useUltraSwapMutation } from 'src/queries/useUltraSwapMutation';

export interface IForm {
  fromMint: string;
  toMint: string;
  fromValue: string;
  toValue: string;
}

export type QuoteResponse = {
  original: UltraQuoteResponse;
  quoteResponse: FormattedUltraQuoteResponse;
};

export type SwappingStatus = 'loading' | 'pending-approval' | 'sending' | 'fail' | 'success' | 'timeout';
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
  quoteResponseMeta: QuoteResponse | null;
  setQuoteResponseMeta: Dispatch<SetStateAction<QuoteResponse | null>>;
  onSubmit: VoidFunction;
  lastSwapResult: { swapResult: SwapResult; quoteReponse: QuoteResponse | null } | null;
  formProps: FormProps;
  displayMode: IInit['displayMode'];
  scriptDomain: IInit['scriptDomain'];
  swapping: {
    txStatus:
      | {
          txid: string;
          status: SwappingStatus;
        }
      | undefined;
  };
  reset: (props?: { resetValues: boolean }) => void;
  refresh: () => void;
  loading: boolean;
  quoteError?: unknown;
  lastRefreshTimestamp: number | undefined;
  isToPairFocused: MutableRefObject<boolean>;
  enableWalletPassthrough?: boolean;
}

export const SwapContext = createContext<ISwapContext | null>(null);

export class SwapTransactionTimeoutError extends Error {
  constructor() {
    super('Transaction timed-out');
  }
}

export function useSwapContext() {
  const context = useContext(SwapContext);
  if (!context) throw new Error('Missing SwapContextProvider');
  return context;
}

export const PRIORITY_NONE = 0; // No additional fee
export const PRIORITY_HIGH = 0.000_005; // Additional fee of 1x base fee
export const PRIORITY_TURBO = 0.000_5; // Additional fee of 100x base fee
export const PRIORITY_MAXIMUM_SUGGESTED = 0.01;

const INITIAL_FORM = {
  fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  toMint: WRAPPED_SOL_MINT.toString(),
  fromValue: '',
  toValue: '',
};

export const SwapContextProvider = (props: PropsWithChildren<IInit>) => {
  const { displayMode, scriptDomain, formProps: originalFormProps, children, enableWalletPassthrough } = props;
  const { screen } = useScreenState();
  const { isLoaded, getTokenInfo } = useTokenContext();
  const { wallet } = useWalletPassThrough();
  const { refresh: refreshAccount } = useAccounts();
  const isToPairFocused = useRef<boolean>(false);
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);
  const formProps: FormProps = useMemo(() => ({ ...INITIAL_FORM, ...originalFormProps }), [originalFormProps]);

  const [form, setForm] = useState<IForm>({
    fromMint: formProps?.initialInputMint ?? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: formProps?.initialOutputMint ?? WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
  });

  useEffect(() => {
    if (formProps.fixedMint) {
      if (formProps.fixedMint !== formProps.initialInputMint && formProps.fixedMint !== formProps.initialOutputMint) {
        console.error('fixedMint is not the same as the initial input or output mint');
      }
    }
  }, [formProps.fixedMint, formProps.initialInputMint, formProps.initialOutputMint]);

  const [errors, setErrors] = useState<Record<string, { title: string; message: string }>>({});

  const fromTokenInfo = useMemo(() => {
    if (!isLoaded) return null;
    const tokenInfo = form.fromMint ? getTokenInfo(form.fromMint) : null;
    return tokenInfo;
  }, [form.fromMint, isLoaded, getTokenInfo]);

  const toTokenInfo = useMemo(() => {
    if (!isLoaded) return null;
    const tokenInfo = form.toMint ? getTokenInfo(form.toMint) : null;
    return tokenInfo;
  }, [form.toMint, getTokenInfo, isLoaded]);

  // Set value given initial amount
  const setupInitialAmount = useCallback(() => {
    if (!formProps?.initialAmount || !fromTokenInfo || !toTokenInfo) return;

    const toUiAmount = (mint: string) => {
      const tokenInfo = mint ? getTokenInfo(mint) : undefined;

      if (!tokenInfo) return;
      if (!formProps.initialAmount) {
        return;
      }
      const value = new Decimal(formProps.initialAmount).div(Math.pow(10, tokenInfo.decimals)).toFixed();
      return value;
    };
    setTimeout(() => {
      setForm((prev) => ({ ...prev, fromValue: toUiAmount(prev.fromMint) ?? '' }));
    }, 0);
  }, [formProps.initialAmount, fromTokenInfo, getTokenInfo, toTokenInfo]);

  useEffect(() => {
    setupInitialAmount();
  }, [formProps.initialAmount, setupInitialAmount]);

  const debouncedForm = useDebounce(form, 250);

  const amount = useMemo(() => {
    if (!fromTokenInfo || !toTokenInfo) {
      return JSBI.BigInt(0);
    }
    if (isToPairFocused.current === true) {
      if (!debouncedForm.toValue || !hasNumericValue(debouncedForm.toValue)) {
        return JSBI.BigInt(0);
      }
      return JSBI.BigInt(new Decimal(debouncedForm.toValue).mul(Math.pow(10, toTokenInfo.decimals)).floor().toFixed());
    } else {
      if (!debouncedForm.fromValue || !hasNumericValue(debouncedForm.fromValue)) {
        return JSBI.BigInt(0);
      }
      return JSBI.BigInt(
        new Decimal(debouncedForm.fromValue).mul(Math.pow(10, fromTokenInfo.decimals)).floor().toFixed(),
      );
    }
  }, [debouncedForm.fromValue, debouncedForm.toValue, fromTokenInfo, toTokenInfo]);

  const [txStatus, setTxStatus] = useState<ISwapContext['swapping']['txStatus']>(undefined);
  const {
    data: ogQuoteResponseMeta,
    isFetching: loading,
    error: quoteError,
    refetch: refresh,
    errorUpdatedAt,
    dataUpdatedAt,
    isSuccess,
    isError,
  } = useQuoteQuery(
    {
      inputMint: debouncedForm.fromMint,
      outputMint: debouncedForm.toMint,
      amount: amount.toString(),
      taker: walletPublicKey,
      swapMode: isToPairFocused.current ? 'ExactOut' : 'ExactIn',
      referralAccount: formProps.referralAccount,
      referralFee: formProps.referralFee,
    },
    // Stop refetching when transaction is in progress
    !txStatus,
  );

  useEffect(() => {
    if (quoteError) {
      if (typeof quoteError === 'string') {
        setErrors({
          fromValue: { title: quoteError, message: '' },
        });
        return ;
      }

      setErrors({
        fromValue: { title: 'Error fetching route. Try changing your input', message: '' },
      });
      return ;
    }
    setErrors({});
  }, [quoteError]);

  const lastRefreshTimestamp = useMemo(() => {
    if (loading) {
      return new Date().getTime();
    }
    if (isError) {
      return new Date(errorUpdatedAt).getTime();
    }
    if (isSuccess) {
      return new Date(dataUpdatedAt).getTime();
    }
    return undefined;
  }, [loading, errorUpdatedAt, dataUpdatedAt, isError, isSuccess]);

  const [quoteResponseMeta, setQuoteResponseMeta] = useState<QuoteResponse | null>(null);
  useEffect(() => {
    if (!ogQuoteResponseMeta) {
      setQuoteResponseMeta(null);
      return;
    }
    // the UI sorts the best route depending on ExactIn or ExactOut
    setQuoteResponseMeta(ogQuoteResponseMeta);
  }, [ogQuoteResponseMeta]);

  useEffect(() => {
    if (!form.fromValue && !form.toValue && !quoteResponseMeta) {
      setForm((prev) => ({ ...prev, fromValue: '', toValue: '' }));
      return;
    }

    setForm((prev) => {
      const newValue = { ...prev };

      if (!fromTokenInfo || !toTokenInfo) return prev;

      const { outAmount, inAmount } = quoteResponseMeta?.quoteResponse || {};
      if (!isToPairFocused.current) {
        newValue.toValue = outAmount ? new Decimal(outAmount.toString()).div(10 ** toTokenInfo.decimals).toFixed() : '';
      } else {
        newValue.fromValue = inAmount
          ? new Decimal(inAmount.toString()).div(10 ** fromTokenInfo.decimals).toFixed()
          : '';
      }
      return newValue;
    });
  }, [form.fromValue, form.toValue, fromTokenInfo, quoteResponseMeta, toTokenInfo]);

  const [lastSwapResult, setLastSwapResult] = useState<ISwapContext['lastSwapResult']>(null);

  const { mutateAsync: ultraSwapMutation } = useUltraSwapMutation();

  // const executeTransaction = useExecuteTransaction();
  const onSubmit = useCallback(async () => {
    if (!walletPublicKey || !wallet?.adapter || !quoteResponseMeta) {
      return null;
    }

    setTxStatus({
      txid: '',
      status: 'loading',
    });

    try {
      if (!fromTokenInfo) throw new Error('Missing fromTokenInfo');
      if (!toTokenInfo) throw new Error('Missing toTokenInfo');
      await ultraSwapMutation({
        quoteResponseMeta,
        fromTokenInfo,
        toTokenInfo,
        setTxStatus,
        setLastSwapResult,
      });
    } catch (error) {
      console.log('Swap error', error);
    }
  }, [walletPublicKey, wallet?.adapter, quoteResponseMeta, ultraSwapMutation, fromTokenInfo, toTokenInfo]);

  const reset = useCallback(
    ({ resetValues } = { resetValues: false }) => {
      if (resetValues) {
        setForm(INITIAL_FORM);
        setupInitialAmount();
      } else {
        setForm((prev) => ({ ...prev, toValue: '' }));
      }

      setQuoteResponseMeta(null);
      setErrors({});
      setLastSwapResult(null);
      setTxStatus(undefined);
      refreshAccount();
    },
    [refreshAccount, setupInitialAmount],
  );

  // onFormUpdate callback
  useEffect(() => {
    if (typeof window.Jupiter.onFormUpdate === 'function') {
      window.Jupiter.onFormUpdate(form);
    }
  }, [form]);

  // onFormUpdate callback
  useEffect(() => {
    if (typeof window.Jupiter.onScreenUpdate === 'function') {
      window.Jupiter.onScreenUpdate(screen);
    }
  }, [screen]);

  return (
    <SwapContext.Provider
      value={{
        form,
        setForm,
        errors,
        setErrors,
        fromTokenInfo,
        toTokenInfo,
        quoteResponseMeta,
        setQuoteResponseMeta,
        onSubmit,
        lastSwapResult,
        reset,
        refresh,
        loading,
        quoteError,
        lastRefreshTimestamp,
        isToPairFocused,
        displayMode,
        formProps,
        scriptDomain,
        swapping: {
          txStatus,
        },
        enableWalletPassthrough,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};
