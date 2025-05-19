import { WalletSignTransactionError } from '@jup-ag/wallet-adapter';
import { TokenInfo } from '@solana/spl-token-registry';
import { useMutation } from '@tanstack/react-query';
import { ISwapContext, QuoteResponse } from 'src/contexts/SwapContext';
import { ultraSwapService } from 'src/data/UltraSwapService';
import { Buffer } from 'buffer';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { TransactionError } from '@mercurial-finance/optimist';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

interface UltraSwapMutationProps {
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
  setTxStatus: (status: ISwapContext['swapping']['txStatus']) => void;
  setLastSwapResult: (result: ISwapContext['lastSwapResult']) => void;
  quoteResponseMeta: QuoteResponse;
}

enum UltraSwapErrorType {
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  WALLET_SIGNING_FAILED = 'WALLET_SIGNING_FAILED',
}

class UltraSwapError extends Error {
  type: UltraSwapErrorType;
  txid?: string;
  constructor(message: string, type: UltraSwapErrorType, txid?: string) {
    super(message);
    this.type = type;
    this.txid = txid;
  }
}

export function useUltraSwapMutation() {
  const { wallet, signTransaction } = useWalletPassThrough();
  return useMutation({
    mutationFn: async ({
      setTxStatus,
      setLastSwapResult,
      fromTokenInfo,
      toTokenInfo,
      quoteResponseMeta,
    }: UltraSwapMutationProps) => {
      const publicKey = wallet?.adapter.publicKey;
      if (!signTransaction || !publicKey) {
        throw new UltraSwapError(
          'Wallet not connected, or missing wallet functions',
          UltraSwapErrorType.WALLET_SIGNING_FAILED,
        );
      }

      setTxStatus({
        txid: '',
        status: 'pending-approval',
      });

      const selectedQuote = quoteResponseMeta.original;

      const { transaction, requestId } = selectedQuote;

      if (!transaction) throw new Error('Missing transaction');
      const based64tx = Buffer.from(transaction, 'base64');

      const versionedTransaction = VersionedTransaction.deserialize(new Uint8Array(based64tx));

      const signedTransaction = await signTransaction(versionedTransaction);
      const serializedTransaction = Buffer.from(signedTransaction.serialize()).toString('base64');

      setTxStatus({
        txid: '',
        status: 'sending',
      });

      const response = await ultraSwapService.submitSwap(serializedTransaction, requestId);

      const { signature, status } = response;

      if (status === 'Failed') {
        throw new UltraSwapError(response.error, UltraSwapErrorType.FAILED, signature);
      }

      const { inputAmountResult, outputAmountResult } = response;

      setTxStatus({
        txid: signature,
        status: 'success',
      });
      setLastSwapResult({
        swapResult: {
          txid: signature,
          inputAddress: new PublicKey(fromTokenInfo.address),
          outputAddress: new PublicKey(toTokenInfo.address),
          inputAmount: Number(inputAmountResult),
          outputAmount: Number(outputAmountResult),
        },
        quoteReponse: quoteResponseMeta,
      });
      return signature;
    },
    onError: async (error, variables) => {
      const { setTxStatus, setLastSwapResult, quoteResponseMeta } = variables;
      if (error instanceof WalletSignTransactionError) {
        const message = error.message || error.error || 'Transaction cancelled';
        setLastSwapResult({
          swapResult: {
            error: new TransactionError(message),
          },
          quoteReponse: quoteResponseMeta,
        });
        return;
      }

      if (error instanceof Error) {
        setLastSwapResult({
          swapResult: {
            error: new TransactionError(error.message),
          },
          quoteReponse: quoteResponseMeta,
        });
        return;
      }

      if ('json' in (error as any)) {
        const json = (await (error as any).json()) as {
          txid: string;
          signature: string;
          error: string;
          status: string;
        };

        setLastSwapResult({
          swapResult: {
            error: new TransactionError(json.error || 'Unknown error'),
          },
          quoteReponse: quoteResponseMeta,
        });

        setTxStatus({
          txid: json.txid || '',
          status: 'fail',
        });
      }
    },
  });
}
