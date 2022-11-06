
import { TokenInfo } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Form from '../../components/Form';
import FormPairSelector from '../../components/FormPairSelector';
import { useAccounts } from '../../contexts/accounts';
import { useTokenContext } from '../../contexts/TokenContextProvider';
import { WalletModal } from 'src/components/WalletComponents/components/WalletModal';
import { useSwapContext } from 'src/contexts/SwapContext';
import { useScreenState } from 'src/contexts/ScreenProvider';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

interface Props {
  mint: PublicKey;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}



const InitialScreen = ({ mint, setIsWalletModalOpen, isWalletModalOpen }: Props) => {
  const { wallet } = useWalletPassThrough();
  const { accounts } = useAccounts();
  const { tokenMap } = useTokenContext();
  const {
    form,
    setForm,
    setErrors,
    outputRoute, jupiter: { loading } } = useSwapContext();
  const { setScreen } = useScreenState();

  const walletPublicKey = useMemo(() => wallet?.adapter.publicKey?.toString(), [
    wallet?.adapter.publicKey,
  ]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, toMint: mint?.toString() }));
  }, [mint]);

  // TODO: Dedupe the balance
  const balance = useMemo(() => {
    return form.fromMint ? (accounts[form.fromMint]?.balance || 0) : 0;
  }, [walletPublicKey, accounts, form.fromMint]);

  const isDisabled = useMemo(() => {
    if (
      !form.fromValue ||
      !form.fromMint ||
      !form.toMint ||
      !form.toValue ||
      !outputRoute ||
      loading
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
          onSubmit={onSubmitToConfirmation}
          isDisabled={isDisabled}
          setIsFormPairSelectorOpen={setIsFormPairSelectorOpen}
          setIsWalletModalOpen={setIsWalletModalOpen}
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
