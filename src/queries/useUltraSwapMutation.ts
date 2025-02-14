import { useConnection, useWallet } from '@jup-ag/wallet-adapter';
import { TokenInfo } from '@solana/spl-token-registry';
import { useMutation } from '@tanstack/react-query';
import { ISwapContext, QuoteResponse } from 'src/contexts/SwapContext';
import { ultraSwapService } from 'src/data/UltraSwapService';
import { Buffer } from 'buffer';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getTokenBalanceChangesFromTransactionResponse } from '@jup-ag/common';

interface UltraSwapMutationProps {
//   tx: string;
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
//   requestId: string;
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
  const { wallet, signTransaction } = useWallet();
  const { connection } = useConnection();
  return useMutation({
    mutationFn: async ({ setTxStatus, setLastSwapResult, fromTokenInfo, toTokenInfo, quoteResponseMeta }: UltraSwapMutationProps) => {
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
        quotedDynamicSlippageBps: '',
        // quotedDynamicSlippageBps: swapTransactionResponse.dynamicSlippageReport?.slippageBps?.toString(),
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
        quotedDynamicSlippageBps: '',
        // quotedDynamicSlippageBps: swapTransactionResponse.dynamicSlippageReport?.slippageBps?.toString(),
      });


      
      const response = await ultraSwapService.submitSwap(serializedTransaction, requestId);

      const { signature, status } = response;
      if (status !== 'Success') {
        throw new UltraSwapError('Failed to submit transaction', UltraSwapErrorType.FAILED, signature);
        // TODO: handle error
      }


      const transactionResponse = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      const [sourceTokenBalanceChange, destinationTokenBalanceChange] = getTokenBalanceChangesFromTransactionResponse({
        txid: signature,
        inputMint: new PublicKey(fromTokenInfo.address),
        outputMint: new PublicKey(toTokenInfo.address),
        hasWrappedSOL: false,
        transactionResponse,
        user: publicKey,
        sourceAddress: new PublicKey(fromTokenInfo.address),
        destinationAddress: new PublicKey(toTokenInfo.address),
      });




      setTxStatus({
        txid: signature,
        status: 'success',
        quotedDynamicSlippageBps: '',
      });
      setLastSwapResult({
        swapResult: {
          txid: signature,
          inputAddress: new PublicKey(fromTokenInfo.address),
          outputAddress: new PublicKey(toTokenInfo.address),
          inputAmount: sourceTokenBalanceChange,
          outputAmount: destinationTokenBalanceChange,
        },
        quoteResponseMeta: quoteResponseMeta,
      });
      return signature;
    },
    onError: async(error, variables) => {
        const {setTxStatus, setLastSwapResult, quoteResponseMeta} = variables;

        setLastSwapResult({
            swapResult: {
            //   error: error.toString(),
            },
            quoteResponseMeta: quoteResponseMeta,
          });
        if(error instanceof UltraSwapError) {
            

            setTxStatus({
                txid: error.txid || '',
                status: 'fail',
                quotedDynamicSlippageBps: '',
              });
        }

        //           setTxStatus({
        //     txid: result.txid || '',
        //     status: 'error' in result && result.error?.message.includes('expired') ? 'timeout' : 'fail',
        //     quotedDynamicSlippageBps: swapTransactionResponse.dynamicSlippageReport?.slippageBps?.toString(),
        //   });

    },
  });
}
