import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { DCA, Network } from '@jup-ag/dca-sdk';
import { IConfirmationTxDescription, OnTransaction, SwapMode, SwapResult } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { BONK_MINT, WRAPPED_SOL_MINT } from 'src/constants';
import { DcaIntegration, IDL } from 'src/dca/idl';
import { FormProps, IInit } from 'src/types';
import { useTokenContext } from './TokenContextProvider';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import { useAccounts } from './accounts';
import Decimal from 'decimal.js';
import { setupDCA } from 'src/dca';
import { BN } from 'bn.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { useQuery } from '@tanstack/react-query';

export interface IForm {
  fromMint: string;
  toMint: string;
  fromValue: string;
  toValue: string;
  selectedPlan: ILockingPlan['name'];
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
  onSubmit: () => Promise<any>;
  formProps: FormProps;
  displayMode: IInit['displayMode'];
  scriptDomain: IInit['scriptDomain'];
  swapping: {
    totalTxs: number;
    txStatus?: {
      txid: string;
      txDescription: string;
      status: 'loading' | 'fail' | 'success';
    };
  };
  dca: {
    program: Program<DcaIntegration> | null;
    dcaClient: DCA | null;
    provider: AnchorProvider | null;
  };
  refresh: () => void;
  reset: (props?: { resetValues: boolean }) => void;
}

export const initialSwapContext: ISwapContext = {
  form: {
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
    selectedPlan: '30 days',
  },
  setForm() {},
  errors: {},
  setErrors() {},
  fromTokenInfo: undefined,
  toTokenInfo: undefined,
  onSubmit: async () => null,
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
    txStatus: undefined,
  },
  dca: {
    program: null,
    dcaClient: null,
    provider: null,
  },
  refresh() {},
  reset() {},
};

export type ILockingPlan = {
  name: '30 days' | '60 days' | '90 days';
  numberOfTrade: number;
  minAmountInUSD: number;
  maxAmountInUSD: number;
  incetivesPct: number;
};

export const LOCKING_PLAN: ILockingPlan[] = [
  {
    name: `30 days`,
    numberOfTrade: 5, // TODO: Change this to 30
    minAmountInUSD: 10,
    maxAmountInUSD: 1000,
    incetivesPct: 5,
  },
  {
    name: `60 days`,
    numberOfTrade: 60,
    minAmountInUSD: 10,
    maxAmountInUSD: 1000,
    incetivesPct: 20,
  },
  {
    name: `90 days`,
    numberOfTrade: 90,
    minAmountInUSD: 10,
    maxAmountInUSD: 1000,
    incetivesPct: 30,
  },
];

export const SECONDS_IN_MINUTE = 60; // 1 minute
export const SECONDS_IN_DAY = 86400; // 1 day
// TODO: Change this to day
export const DEFAULT_FREQUENCY = SECONDS_IN_MINUTE;

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
  const { displayMode, scriptDomain, formProps: originalFormProps, children } = props;

  const { tokenMap } = useTokenContext();
  const { wallet } = useWalletPassThrough();
  const { refresh: refreshAccount } = useAccounts();
  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey, [wallet?.adapter.publicKey]);

  const formProps: FormProps = useMemo(
    () => ({ ...initialSwapContext.formProps, ...originalFormProps }),
    [originalFormProps],
  );

  const [form, setForm] = useState<IForm>({
    fromMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    toMint: WRAPPED_SOL_MINT.toString(),
    fromValue: '',
    toValue: '',
    selectedPlan: '30 days',
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

  const [totalTxs, setTotalTxs] = useState(0);
  const [txStatus, setTxStatus] = useState<{
    txid: string;
    txDescription: string;
    status: 'loading' | 'fail' | 'success';
  }>();

  const refreshAll = () => {
    refreshAccount();
  };

  const reset = useCallback(({ resetValues } = { resetValues: true }) => {
    setTimeout(() => {
      if (resetValues) {
        setForm({ ...initialSwapContext.form, ...formProps });
      }

      setErrors(initialSwapContext.errors);
      setTxStatus(initialSwapContext.swapping.txStatus);
      setTotalTxs(initialSwapContext.swapping.totalTxs);
      refreshAll();
    }, 0);
  }, []);

  useQuery(
    ['refresh-account'],
    () => {
      if (!walletPublicKey) return;

      return refreshAccount();
    },
    {
      refetchInterval: 10_000,
    },
  );

  const { signTransaction } = useWallet();
  const { connection } = useConnection();
  const programId = new PublicKey('5mrhiqFFXyfJMzAJc5vsEQ4cABRhfsP7MgSVgGQjfcrR');
  const provider = new AnchorProvider(connection, {} as any, AnchorProvider.defaultOptions());
  const program = new Program(IDL, programId, provider);
  const dcaClient = new DCA(connection, Network.MAINNET);

  const onSubmit = useCallback(async () => {
    const plan = LOCKING_PLAN.find((plan) => plan.name === form.selectedPlan);
    if (!program || !dcaClient || !plan || !fromTokenInfo || !walletPublicKey || !signTransaction) return;

    try {
      const frequency = plan.numberOfTrade;
      const inAmount = new Decimal(form.fromValue).mul(10 ** fromTokenInfo.decimals);
      const userInTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(form.fromMint),
        walletPublicKey,
      );

      let tx = await setupDCA({
        program,
        dcaClient,
        connection,
        userPublicKey: walletPublicKey,
        userInTokenAccount,
        inputMint: new PublicKey(form.fromMint),
        outputMint: new PublicKey(form.toMint),
        inAmount: new BN(inAmount.toString()),
        inAmountPerCycle: new BN(inAmount.div(new Decimal(frequency)).floor().toString()),
        cycleSecondsApart: new BN(DEFAULT_FREQUENCY),
      });

      tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
      tx.feePayer = walletPublicKey;
      tx = await signTransaction(tx);
      const rawTransaction = tx.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });

      setTotalTxs(1);
      setTxStatus({ txid, txDescription: 'Locking your tokens...', status: 'loading' });

      const result = await connection.confirmTransaction(txid, 'confirmed');
      if (result.value.err) throw result.value.err;

      setTxStatus({ txid, txDescription: 'Locking your tokens...', status: 'success' });
    } catch (error) {
      console.error(error);
      setTxStatus({ txid: '', txDescription: (error as any)?.message, status: 'fail' });
    } finally {
      refreshAll();
    }
  }, [form, walletPublicKey]);

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
        reset,
        refresh: refreshAll,

        displayMode,
        formProps,
        scriptDomain,
        swapping: {
          totalTxs,
          txStatus,
        },
        dca: {
          program,
          dcaClient,
          provider,
        },
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};
