import { executeTransaction } from '@jup-ag/common';
import { ZERO } from '@jup-ag/math';
import { Owner, QuoteResponseMeta, SwapMode, SwapResult, UseJupiterProps, useJupiter } from '@jup-ag/react-hook';
import { SignerWalletAdapter, useConnection, useLocalStorage } from '@jup-ag/wallet-adapter';
import { TokenInfo } from '@solana/spl-token-registry';
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_SLIPPAGE, WRAPPED_SOL_MINT } from 'src/constants';
import { fromLamports, getAssociatedTokenAddressSync, hasNumericValue } from 'src/misc/utils';
import { useReferenceFeesQuery } from 'src/queries/useReferenceFeesQuery';
import { FormProps, IInit, IOnRequestIxCallback } from 'src/types';
import {
  PRIORITY_LEVEL_MULTIPLIER_HIGH,
  PRIORITY_LEVEL_MULTIPLIER_VERY_HIGH,
  usePrioritizationFee,
} from './PrioritizationFeeContextProvider';
import { useScreenState } from './ScreenProvider';
import { useTokenContext } from './TokenContextProvider';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import { useAccounts } from './accounts';
export interface IForm {
  fromMint: string;
  toMint: string;
  fromValue: string;
  toValue: string;
  slippageBps: number;
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
  quoteResponseMeta: QuoteResponseMeta | null;
  setQuoteResponseMeta: Dispatch<SetStateAction<QuoteResponseMeta | null>>;
  onSubmit: () => Promise<SwapResult | null>;
  onRequestIx: () => Promise<IOnRequestIxCallback>;
  lastSwapResult: { swapResult: SwapResult; quoteResponseMeta: QuoteResponseMeta | null } | null;
  formProps: FormProps;
  displayMode: IInit['displayMode'];
  scriptDomain: IInit['scriptDomain'];
  swapping: {
    txStatus:
      | {
          txid: string;
          status: 'loading' | 'fail' | 'success' | 'timeout';
        }
      | undefined;
  };
  reset: (props?: { resetValues: boolean }) => void;
  jupiter: Omit<ReturnType<typeof useJupiter>, 'exchange' | 'quoteResponseMeta'> & {
    exchange: ReturnType<typeof useJupiter>['exchange'] | undefined;
    asLegacyTransaction: boolean;
    setAsLegacyTransaction: Dispatch<SetStateAction<boolean>>;
    quoteResponseMeta: QuoteResponseMeta | undefined | null;
  };
  setUserSlippage: Dispatch<SetStateAction<number | undefined>>;
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
  slippageBps: Math.ceil(DEFAULT_SLIPPAGE * 100),
};

export const SwapContextProvider: FC<{
  displayMode: IInit['displayMode'];
  scriptDomain?: string;
  asLegacyTransaction: boolean;
  setAsLegacyTransaction: React.Dispatch<React.SetStateAction<boolean>>;
  formProps?: FormProps;
  maxAccounts?: number;
  useUserSlippage?: boolean;
  slippagePresets?: number[];
  children: ReactNode;
}> = (props) => {
  const {
    displayMode,
    scriptDomain,
    asLegacyTransaction,
    setAsLegacyTransaction,
    formProps: originalFormProps,
    maxAccounts,
    children,
  } = props;
  const { screen } = useScreenState();
  const { tokenMap } = useTokenContext();
  const { wallet } = useWalletPassThrough();
  const { refresh: refreshAccount } = useAccounts();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);
  const formProps: FormProps = useMemo(() => ({ ...INITIAL_FORM, ...originalFormProps }), [originalFormProps]);
  const [userSlippage, setUserSlippage] = useLocalStorage<number | undefined>('jupiter-terminal-slippage', undefined);
  const [form, setForm] = useState<IForm>(
    (() => {
      const slippageBps = (() => {
        if (props.useUserSlippage && typeof userSlippage !== 'undefined') {
          return Math.ceil(userSlippage * 100);
        }

        if (formProps?.initialSlippageBps) {
          return formProps?.initialSlippageBps;
        }
        return Math.ceil(DEFAULT_SLIPPAGE * 100);
      })();

      return {
        fromMint: formProps?.initialInputMint ?? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        toMint: formProps?.initialOutputMint ?? WRAPPED_SOL_MINT.toString(),
        fromValue: '',
        toValue: '',
        slippageBps,
      };
    })(),
  );
  const [errors, setErrors] = useState<Record<string, { title: string; message: string }>>({});
  const jupiterSwapMode = useMemo(
    () => (formProps?.swapMode ? SwapMode[formProps?.swapMode] : SwapMode.ExactIn),
    [formProps?.swapMode],
  );

  const fromTokenInfo = useMemo(() => {
    const tokenInfo = form.fromMint ? tokenMap.get(form.fromMint) : null;
    return tokenInfo;
  }, [form.fromMint, tokenMap]);

  const toTokenInfo = useMemo(() => {
    const tokenInfo = form.toMint ? tokenMap.get(form.toMint) : null;
    return tokenInfo;
  }, [form.toMint, tokenMap]);

  // Set value given initial amount
  const setupInitialAmount = useCallback(() => {
    if (!formProps?.initialAmount || tokenMap.size === 0 || !fromTokenInfo || !toTokenInfo) return;

    const toUiAmount = (mint: string) => {
      const tokenInfo = mint ? tokenMap.get(mint) : undefined;
      if (!tokenInfo) return;
      return String(fromLamports(JSBI.BigInt(formProps.initialAmount ?? 0), tokenInfo.decimals));
    };

    if (jupiterSwapMode === SwapMode.ExactOut) {
      setTimeout(() => {
        setForm((prev) => {
          return { ...prev, toValue: toUiAmount(prev.toMint) ?? '' };
        });
      }, 0);
    } else {
      setTimeout(() => {
        setForm((prev) => ({ ...prev, fromValue: toUiAmount(prev.fromMint) ?? '' }));
      }, 0);
    }
  }, [formProps?.initialAmount, jupiterSwapMode, tokenMap]);

  useEffect(() => {
    setupInitialAmount();
  }, [formProps?.initialAmount, jupiterSwapMode, tokenMap]);

  const jupiterParams: UseJupiterProps = useMemo(() => {
    const amount = (() => {
      if (jupiterSwapMode === SwapMode.ExactOut) {
        if (!form.toValue || !toTokenInfo) return JSBI.BigInt(0);
        return JSBI.BigInt(new Decimal(form.toValue).mul(10 ** toTokenInfo.decimals));
      } else {
        if (!form.fromValue || !fromTokenInfo || !hasNumericValue(form.fromValue)) return JSBI.BigInt(0);
        return JSBI.BigInt(new Decimal(form.fromValue).mul(10 ** fromTokenInfo.decimals));
      }
    })();

    return {
      amount,
      inputMint: form.fromMint ? new PublicKey(form.fromMint) : undefined,
      outputMint: form.toMint ? new PublicKey(form.toMint) : undefined,
      swapMode: jupiterSwapMode,
      slippageBps: form.slippageBps,
      maxAccounts,
    };
  }, [form, maxAccounts]);

  const {
    quoteResponseMeta: ogQuoteResponseMeta,
    exchange,
    loading: loadingQuotes,
    refresh,
    lastRefreshTimestamp,
    error,
    programIdsExcluded,
    programIdToLabelMap,
    setProgramIdsExcluded,
  } = useJupiter(jupiterParams);

  const { data: referenceFees } = useReferenceFeesQuery();
  const { priorityFeeLamports, priorityLevel, getOptimalComputeUnitLimitAndPrice } = usePrioritizationFee();
  const { connection } = useConnection();

  const [quoteResponseMeta, setQuoteResponseMeta] = useState<QuoteResponseMeta | null>(null);
  useEffect(() => {
    if (!ogQuoteResponseMeta) {
      setQuoteResponseMeta(null);
      return;
    }
    // the UI sorts the best route depending on ExactIn or ExactOut
    setQuoteResponseMeta(ogQuoteResponseMeta);
  }, [jupiterSwapMode, ogQuoteResponseMeta]);

  useEffect(() => {
    if (!form.fromValue && !quoteResponseMeta) {
      setForm((prev) => ({ ...prev, fromValue: '', toValue: '' }));
      return;
    }

    setForm((prev) => {
      const newValue = { ...prev };

      let { inAmount, outAmount } = quoteResponseMeta?.quoteResponse || {};
      if (jupiterSwapMode === SwapMode.ExactIn) {
        newValue.toValue = outAmount ? String(fromLamports(outAmount, toTokenInfo?.decimals || 0)) : '';
      } else {
        newValue.fromValue = inAmount ? String(fromLamports(inAmount, fromTokenInfo?.decimals || 0)) : '';
      }
      return newValue;
    });
  }, [form.fromValue, fromTokenInfo?.decimals, jupiterSwapMode, quoteResponseMeta, toTokenInfo?.decimals]);

  const [txStatus, setTxStatus] = useState<
    | {
        txid: string;
        status: 'loading' | 'fail' | 'success' | 'timeout';
      }
    | undefined
  >(undefined);

  const [lastSwapResult, setLastSwapResult] = useState<ISwapContext['lastSwapResult']>(null);

  const onSubmitWithIx = useCallback(
    (swapResult: SwapResult) => {
      try {
        if ('error' in swapResult) throw swapResult.error;

        if ('txid' in swapResult) {
          console.log({ swapResult });
          setTxStatus({ txid: swapResult.txid, status: 'success' });
          setLastSwapResult({ swapResult, quoteResponseMeta });
        }
      } catch (error) {
        console.log('Swap error', error);
        setTxStatus({ txid: '', status: 'fail' });
        setLastSwapResult({ swapResult, quoteResponseMeta });
      }
    },
    [quoteResponseMeta],
  );

  const onRequestIx = useCallback(async (): Promise<IOnRequestIxCallback> => {
    if (!walletPublicKey || !wallet?.adapter) throw new Error('Missing wallet');
    if (!quoteResponseMeta) throw new Error('Missing quote');

    const inputMint = quoteResponseMeta?.quoteResponse.inputMint;
    const outputMint = quoteResponseMeta?.quoteResponse.outputMint;

    // A direct reference from https://station.jup.ag/docs/apis/swap-api#instructions-instead-of-transaction
    const instructions: IOnRequestIxCallback['instructions'] = await (
      await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quoteResponseMeta.original,
          userPublicKey: walletPublicKey,
          /**
           * Note: This is not optimal `computeUnitLimit` as it's not calculated based on the transaction `instructions`
           * This is just a placeholder value to make the API call, we will replace it with the optimal value later,
           * by simulate the transaction and get the optimal value.
           */
          computeUnitPriceMicroLamports,
        }),
      })
    ).json();

    if (!instructions || instructions.error) {
      setErrors({
        'missing-instructions': {
          title: 'Missing instructions',
          message: 'Failed to get swap instructions',
        },
      });

      console.log('Failed to get swap instructions: ', instructions);
      throw new Error('Failed to get swap instructions');
    }

    const [sourceAddress, destinationAddress] = [inputMint, outputMint].map((mint, idx) =>
      getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(walletPublicKey)),
    );

    return {
      meta: {
        sourceAddress,
        destinationAddress,
        quoteResponseMeta,
      },
      instructions,
      onSubmitWithIx,
    };
  }, [walletPublicKey, quoteResponseMeta]);

  const deserializeInstruction = (instruction: IOnRequestIxCallback['instructions']['swapInstruction']) => {
    return new TransactionInstruction({
      programId: new PublicKey(instruction.programId),
      keys: instruction.accounts.map((key) => ({
        pubkey: new PublicKey(key.pubkey),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: Buffer.from(instruction.data, 'base64'),
    });
  };

  const getAddressLookupTableAccounts = useCallback(
    async (keys: string[]): Promise<AddressLookupTableAccount[]> => {
      const addressLookupTableAccountInfos = await connection.getMultipleAccountsInfo(
        keys.map((key) => new PublicKey(key)),
      );

      return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
        const addressLookupTableAddress = keys[index];
        if (accountInfo) {
          const addressLookupTableAccount = new AddressLookupTableAccount({
            key: new PublicKey(addressLookupTableAddress),
            state: AddressLookupTableAccount.deserialize(accountInfo.data),
          });
          acc.push(addressLookupTableAccount);
        }

        return acc;
      }, new Array<AddressLookupTableAccount>());
    },
    [connection],
  );

  const onSubmit = useCallback(async () => {
    if (!walletPublicKey || !wallet?.adapter || !quoteResponseMeta) {
      throw new Error('Missing wallet or quote');
    }

    // Fetch necessary data from APIs
    const { meta, instructions, onSubmitWithIx } = await onRequestIx();
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Destructure instructions
    const {
      setupInstructions,
      swapInstruction: swapInstructionPayload,
      cleanupInstruction,
      addressLookupTableAddresses,
      // Note: Not using this as we need to calculate the optimal compute unit limit and price
      computeBudgetInstructions,
    } = instructions;

    // Prepare address lookup table accounts
    const addressLookupTableAccounts = await getAddressLookupTableAccounts(addressLookupTableAddresses);

    // Prepare transaction instructions
    const setupTransactionInstructions = setupInstructions.map(deserializeInstruction);
    const swapTransactionInstruction = deserializeInstruction(swapInstructionPayload);
    const cleanupTransactionInstruction = cleanupInstruction ? deserializeInstruction(cleanupInstruction) : null;

    const filteredInstructions = [
      ...setupTransactionInstructions,
      swapTransactionInstruction,
      cleanupTransactionInstruction,
    ].filter(Boolean) as TransactionInstruction[];

    // Prepare payer key
    const payerKey = new PublicKey(walletPublicKey);

    // Set optimal compute unit limit and price
    let referenceFee = 0;
    if (referenceFees?.jup) {
      switch (priorityLevel) {
        case 'MEDIUM':
          referenceFee = referenceFees.swapFee;
          break;
        case 'HIGH':
          referenceFee = referenceFees.swapFee * PRIORITY_LEVEL_MULTIPLIER_HIGH;
          break;
        case 'VERY_HIGH':
          referenceFee = referenceFees.swapFee * PRIORITY_LEVEL_MULTIPLIER_VERY_HIGH;
          break;
        default:
          break;
      }
    }
    const { units, microLamports } = await getOptimalComputeUnitLimitAndPrice({
      connection,
      instructions: filteredInstructions,
      payer: payerKey,
      lookupTables: addressLookupTableAccounts,
      referenceFee,
    });
    filteredInstructions.unshift(ComputeBudgetProgram.setComputeUnitPrice({ microLamports }));
    if (units) {
      filteredInstructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
    }

    // Compile to V0 message
    const messageV0 = new TransactionMessage({
      instructions: filteredInstructions,
      payerKey,
      recentBlockhash: blockhash,
    }).compileToV0Message(addressLookupTableAccounts);
    const transaction = new VersionedTransaction(messageV0);

    // Execute the transaction
    try {
      const swapResultPromise = executeTransaction({
        connection,
        wallet: wallet.adapter as SignerWalletAdapter,
        inputMint: meta.quoteResponseMeta.quoteResponse.inputMint,
        outputMint: meta.quoteResponseMeta.quoteResponse.outputMint,
        sourceAddress: meta.sourceAddress,
        destinationAddress: meta.destinationAddress,
        swapTransaction: transaction,
        blockhashWithExpiryBlockHeight: {
          blockhash,
          lastValidBlockHeight,
        },
        owner: new Owner(new PublicKey(walletPublicKey)),
        wrapUnwrapSOL: Boolean(cleanupInstruction),
        onTransaction: async (txid, awaiter) => {
          const tx = txStatus?.txid === txid ? txStatus : undefined;
          if (!tx) {
            setTxStatus((prev) => ({ ...prev, txid, status: 'loading' }));
          }

          const success = !((await awaiter) instanceof Error);

          setTxStatus((prev) => {
            const tx = prev?.txid === txid ? prev : undefined;
            if (tx) {
              tx.status = success ? 'success' : 'fail';
            }
            return prev ? { ...prev } : undefined;
          });
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new SwapTransactionTimeoutError()), 60_000);
      });

      try {
        const swapResult = await Promise.race([timeoutPromise, swapResultPromise]);
        return swapResult as SwapResult;
      } catch (error) {
        if (error instanceof SwapTransactionTimeoutError) {
          setTxStatus({ txid: '', status: 'timeout' });
          throw error;
        }
      }

      // Note: This is not reachable due to race condition handling
      return null;
    } catch (error) {
      console.log('Swap error', error);
      return null;
    }
  }, [
    connection,
    getAddressLookupTableAccounts,
    getOptimalComputeUnitLimitAndPrice,
    onRequestIx,
    priorityLevel,
    quoteResponseMeta,
    referenceFees?.jup,
    wallet?.adapter,
    walletPublicKey,
  ]);

  const refreshAll = () => {
    refresh();
    refreshAccount();
  };

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

  const computeUnitPriceMicroLamports = useMemo(() => {
    if (priorityFeeLamports === undefined) return 0;
    return new Decimal(priorityFeeLamports)
      .mul(10 ** 6) // lamports into microlamports
      .div(1_400_000) // divide by CU
      .round()
      .toNumber();
  }, [priorityFeeLamports]);

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
        onRequestIx,
        lastSwapResult,
        reset,

        displayMode,
        formProps,
        scriptDomain,
        swapping: {
          txStatus,
        },
        jupiter: {
          quoteResponseMeta: JSBI.GT(jupiterParams.amount, ZERO) ? quoteResponseMeta : undefined,
          programIdsExcluded,
          programIdToLabelMap,
          setProgramIdsExcluded,
          exchange,
          loading: loadingQuotes,
          refresh: refreshAll,
          lastRefreshTimestamp,
          error,
          asLegacyTransaction,
          setAsLegacyTransaction,
        },
        setUserSlippage,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};
