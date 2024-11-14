import { getSignature, IDL_V6, JUPITER_PROGRAM_V6_ID } from '@jup-ag/common';
import { useConnection } from '@jup-ag/wallet-adapter';
import { handleSendTransaction, TransactionError } from '@mercurial-finance/optimist';
import { Blockhash, Signer, Transaction, VersionedTransaction, VersionedTransactionResponse } from '@solana/web3.js';
import { useCallback } from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

interface TransactionOptions {
  extraSigners?: Signer[];
  blockhash: Blockhash;
  lastValidBlockHeight: number;
  skipPreflight?: boolean;
}

type IExecuteTransactionResult =
  | {
      success: true;
      txid: string;
      transactionResponse: VersionedTransactionResponse;
    }
  | { success: false; txid?: string; error?: TransactionError }
  | { success: false; status: 'unknown'; txid: string };

export const useExecuteTransaction = () => {
  const { connection } = useConnection();
  const wallet = useWalletPassThrough();

  const executeTransaction = useCallback(
    async (
      tx: Transaction | VersionedTransaction,
      options: {
        blockhash: Blockhash;
        lastValidBlockHeight: number;
        skipPreflight?: boolean;
      },
      callback: {
        onPending: () => void;
        onSending: () => void;
        onProcessed: () => void;
        onSuccess: (txid: string, transactionResponse: VersionedTransactionResponse) => void;
      },
    ): Promise<IExecuteTransactionResult> => {
      if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet not connected');
      }

      let txid = '';
      let response: Awaited<ReturnType<typeof handleSendTransaction>> | undefined = undefined;

      try {
        callback.onPending();
        const signedTx = await wallet.signTransaction(tx);
        txid = getSignature(signedTx);
        let hasConfirmed = false;

        callback.onSending();

        const result = await new Promise<IExecuteTransactionResult>(async (resolve, reject) => {
          connection
            .confirmTransaction(
              {
                signature: txid,
                blockhash: options.blockhash,
                lastValidBlockHeight: options.lastValidBlockHeight,
              },
              'processed',
            )
            .then((val) => {
              if (!hasConfirmed && !val.value.err) {
                callback.onProcessed();
              }
            })
            .catch((e) => {
              console.log(e);
              reject(e);
            });

          response = await handleSendTransaction({
            connection,
            blockhash: options.blockhash,
            lastValidBlockHeight: options.lastValidBlockHeight,
            signedTransaction: signedTx,
            skipPreflight: options.skipPreflight ?? true,
            idl: IDL_V6,
            idlProgramId: JUPITER_PROGRAM_V6_ID,
          });
          hasConfirmed = true;

          if ('error' in response) {
            return reject(response.error);
          }

          callback.onSuccess(txid, response.transactionResponse);
          return resolve({
            success: true,
            txid,
            transactionResponse: response.transactionResponse,
          });
        });

        if ('error' in result) {
          throw result;
        }
        return result;
      } catch (error: any) {
        return { success: false, txid, error };
      }
    },
    [wallet, connection],
  );

  return executeTransaction;
};
