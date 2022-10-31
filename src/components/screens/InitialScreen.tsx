import { SwapMode, useJupiter } from '@jup-ag/react-hook';

import { TokenInfo } from '@solana/spl-token-registry';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import JSBI from 'jsbi';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WRAPPED_SOL_MINT } from '../../constants';

import Form from '../../components/Form';
import FormPairSelector from '../../components/FormPairSelector';
import { useAccounts } from '../../contexts/accounts';
import { fromLamports, toLamports } from '../../misc/utils';
import { useTokenContext } from '../../contexts/TokenContextProvider';
import { WalletModal } from 'src/components/WalletComponents/components/WalletModal';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useScreenState } from 'src/contexts/ScreenProvider';

interface Props {
  mint: PublicKey;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}



const InitialScreen = ({ mint, setIsWalletModalOpen, isWalletModalOpen }: Props) => {
  const { wallet } = useWallet();
  const { accounts } = useAccounts();
  const { tokenMap } = useTokenContext();
  const {
    form,
    setForm,
    errors,
    setErrors,
    fromTokenInfo,
    toTokenInfo,
    outputRoute,
    // onSubmit,
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
  } = useSwapContext();
  const { setScreen } = useScreenState();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, toMint: mint?.toString() }));
  }, [mint]);

  // TODO: Dedupe the balance
  const balance = useMemo(() => {
    return form.fromMint ? accounts[form.fromMint]?.balance : 0;
  }, [walletPublicKey, accounts, form.fromMint]);

  const isDisabled = useMemo(() => {
    if (
      !form.fromValue ||
      !form.fromMint ||
      !form.toMint ||
      !form.toValue ||
      !outputRoute
    )
      return true;
    if (Number(form.fromValue) > balance) {
      setErrors({
        fromValue: { title: 'Insufficient balance', message: '' },
      });
      return true;
    }

    setErrors({});
    return false;
  }, [form, balance]);

  const [isFormPairSelectorOpen, setIsFormPairSelectorOpen] = useState(false);

  const onSelectFromMint = useCallback((tokenInfo: TokenInfo) => {
    setForm((prev) => ({
      ...prev,
      fromMint: tokenInfo.address,
      fromValue: '',
    }));
    setIsFormPairSelectorOpen(false);
  }, []);
  
  const availableMints: TokenInfo[] = useMemo(() => {
    if (Object.keys(accounts).length === 0) return [];

    return Object.keys(accounts)
      .map((mintAddress) => tokenMap.get(mintAddress))
      .filter(Boolean)
      .filter(
        (tokenInfo) => tokenInfo?.address !== mint.toString(),
      ) as TokenInfo[]; // Prevent same token to same token
  }, [accounts, tokenMap]);

  const onSubmitToConfirmation = useCallback(() => {
    setScreen('Confirmation');
  }, [])

  return (
    <>
      {/* Body */}
      <form onSubmit={onSubmitToConfirmation}>
        <Form
          fromTokenInfo={fromTokenInfo}
          toTokenInfo={toTokenInfo}
          form={form}
          errors={errors}
          setForm={setForm}
          onSubmit={onSubmitToConfirmation}
          isDisabled={isDisabled}
          setIsFormPairSelectorOpen={setIsFormPairSelectorOpen}
          setIsWalletModalOpen={setIsWalletModalOpen}
          outputRoute={outputRoute}
        />
      </form>

      {isFormPairSelectorOpen ? (
        <div className="absolute h-full w-full flex justify-center items-center bg-black/50 rounded-lg overflow-hidden">
          <FormPairSelector
            onSubmit={onSelectFromMint}
            tokenInfos={availableMints}
            onClose={() => setIsFormPairSelectorOpen(false)}
          />
        </div>
      ) : null}

      {isWalletModalOpen ? (
        <div className="absolute h-full w-full flex justify-center items-center bg-black/50 rounded-lg overflow-hidden">
          <WalletModal setIsWalletModalOpen={setIsWalletModalOpen} />
        </div>
      ) : null}
    </>
  );
};

export default InitialScreen;
