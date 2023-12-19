import React, { useEffect, useState } from 'react';
import { DEFAULT_EXPLORER, FormProps, IInit } from 'src/types';
import { SignerWalletAdapterProps, useUnifiedWalletContext, useUnifiedWallet } from '@jup-ag/wallet-adapter';
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

// @jup-ag/common are devDeps, you're required to install or come up with a variant of it.
import { executeTransaction, Owner } from '@jup-ag/common';

const IntegratedTerminal = (props: {
  rpcUrl: string;
  formProps: FormProps;
  simulateWalletPassthrough: boolean;
  strictTokenList: boolean;
  defaultExplorer: DEFAULT_EXPLORER;
}) => {
  const { rpcUrl, formProps, simulateWalletPassthrough, strictTokenList, defaultExplorer } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  const passthroughWalletContextState = useUnifiedWallet();
  const { setShowModal } = useUnifiedWalletContext();
  const walletPublicKey = React.useMemo(
    () => passthroughWalletContextState?.publicKey?.toString(),
    [passthroughWalletContextState?.publicKey?.toString()],
  );

  const onRequestIxCallback: IInit['onRequestIxCallback'] = async (ixAndCb) => {
    const { meta, instructions, onSubmitWithIx } = ixAndCb;
    const connection = new Connection(rpcUrl);

    if (
      !walletPublicKey ||
      !passthroughWalletContextState.wallet ||
      !passthroughWalletContextState ||
      !passthroughWalletContextState.signTransaction
    )
      return;

    const {
      tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
      computeBudgetInstructions, // The necessary instructions to setup the compute budget.
      setupInstructions, // Setup missing ATA for the users.
      swapInstruction: swapInstructionPayload, // The actual swap instruction.
      cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
      addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
    } = instructions;

    const deserializeInstruction = (instruction: (typeof instructions)['swapInstruction']) => {
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

    const getAddressLookupTableAccounts = async (keys: string[]): Promise<AddressLookupTableAccount[]> => {
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
    };

    /** TODO: Manipulate your IX here. */
    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    addressLookupTableAccounts.push(...(await getAddressLookupTableAccounts(addressLookupTableAddresses)));

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
      payerKey: new PublicKey(walletPublicKey),
      recentBlockhash: blockhash,
      instructions: [
        ...setupInstructions.map(deserializeInstruction),
        deserializeInstruction(swapInstructionPayload),
        cleanupInstruction ? deserializeInstruction(cleanupInstruction) : null,
      ].filter(Boolean) as TransactionInstruction[],
    }).compileToV0Message(addressLookupTableAccounts);
    /** End of Manipulate IX */

    const transaction = new VersionedTransaction(messageV0);

    const swapResult = await executeTransaction({
      connection,
      wallet: {
        signAllTransactions:
          passthroughWalletContextState.signAllTransactions as SignerWalletAdapterProps['signAllTransactions'],
        signTransaction: passthroughWalletContextState.signTransaction as SignerWalletAdapterProps['signTransaction'],
      },
      onTransaction: undefined,
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
      wrapUnwrapSOL: true,
    });

    onSubmitWithIx(swapResult);
  };

  const launchTerminal = async () => {
    window.Jupiter.init({
      displayMode: 'integrated',
      integratedTargetId: 'integrated-terminal',
      endpoint: rpcUrl,
      formProps,
      enableWalletPassthrough: simulateWalletPassthrough,
      passthroughWalletContextState: simulateWalletPassthrough ? passthroughWalletContextState : undefined,
      onRequestConnectWallet: () => setShowModal(true),
      strictTokenList,
      defaultExplorer,

      onRequestIxCallback,
      maxAccounts: 45,
    });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded || !window.Jupiter.init) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter.init));
      }, 500);
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (isLoaded && Boolean(window.Jupiter.init)) {
        launchTerminal();
      }
    }, 200);
  }, [isLoaded, simulateWalletPassthrough, props]);

  // To make sure passthrough wallet are synced
  useEffect(() => {
    if (!window.Jupiter.syncProps) return;
    window.Jupiter.syncProps({ passthroughWalletContextState });
  }, [passthroughWalletContextState, props]);

  return (
    <div className="min-h-[600px] h-[600px] w-full rounded-2xl text-white flex flex-col items-center p-2 lg:p-4 mb-4 overflow-hidden mt-9">
      <div className="flex flex-col lg:flex-row h-full w-full overflow-auto">
        <div className="w-full h-full rounded-xl overflow-hidden flex justify-center">
          {/* Loading state */}
          {!isLoaded ? (
            <div className="h-full w-full animate-pulse bg-white/10 mt-4 lg:mt-0 lg:ml-4 flex items-center justify-center rounded-xl">
              <p className="">Loading...</p>
            </div>
          ) : null}

          <div
            id="integrated-terminal"
            className={`flex h-full w-full max-w-[384px] overflow-auto justify-center bg-[#282830] rounded-xl ${
              !isLoaded ? 'hidden' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegratedTerminal;
