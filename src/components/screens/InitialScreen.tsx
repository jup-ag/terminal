import { TokenInfo } from '@solana/spl-token-registry';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import Form from '../../components/Form';
import FormPairSelector from '../../components/FormPairSelector';
import { useTokenContext } from '../../contexts/TokenContextProvider';
import Decimal from 'decimal.js';
import { cn } from 'src/misc/cn';
import { useBalances } from 'src/hooks/useBalances';

interface Props {
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InitialScreen = ({ setIsWalletModalOpen, isWalletModalOpen }: Props) => {
  const { data: balances } = useBalances();

  const { tokenMap,getTokenInfo, requestTokenInfo } = useTokenContext();
  const {
    form,
    setForm,
    setErrors,
    quoteResponseMeta,
    formProps: { initialOutputMint,fixedMint },
    loading,
  } = useSwapContext();
  const { setScreen } = useScreenState();

  const balance = useMemo(() => {
    if (!balances) return 0;
    return balances[form.fromMint]?.uiAmount || 0;
  }, [balances, form.fromMint]);

  const [isDisabled, setIsDisabled] = useState(false);
  useEffect(() => {
    if (!form.fromValue || !form.fromMint || !form.toMint || !form.toValue || !quoteResponseMeta || loading) {
      setErrors({});
      setIsDisabled(true);
      return;
    }

    const tokenInfo = getTokenInfo(form.fromMint);

    if (new Decimal(form.fromValue).gt(balance)) {
      setErrors({
        fromValue: { title: `Insufficient ${tokenInfo?.symbol}`, message: '' },
      });
      setIsDisabled(true);
      return;
    }

    setErrors({});
    setIsDisabled(false);
  }, [form, balance, quoteResponseMeta, loading, setErrors, getTokenInfo]);

  const [selectPairSelector, setSelectPairSelector] = useState<'fromMint' | 'toMint' | null>(null);
  
  const onSelectMint = useCallback(
    async (tokenInfo: TokenInfo) => {
      await requestTokenInfo([tokenInfo.address]);
      if (selectPairSelector === 'fromMint') {
        setForm((prev) => ({
          ...prev,
          fromMint: tokenInfo.address,
          fromValue: '',

          // Prevent same token to same token;
          ...(prev.toMint === tokenInfo.address ? { toMint: prev.fromMint } : undefined),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          toMint: tokenInfo.address,
          toValue: '',

          // Prevent same token to same token;
          ...(prev.fromMint === tokenInfo.address ? { fromMint: prev.toMint } : undefined),
        }));
      }
      setSelectPairSelector(null);
    },
    [selectPairSelector, setForm, requestTokenInfo],
  );

  const availableMints: TokenInfo[] = useMemo(() => {
    let result = [...tokenMap.values()];
    // On fixedOutputMint, prevent user from selecting the same token as output
    if (fixedMint) {
      result = result.filter((item) => item.address !== initialOutputMint);
    }

    return result;
  }, [tokenMap, fixedMint, initialOutputMint]);

  const onSubmitToConfirmation = useCallback(() => {
    setScreen('Swapping');
  }, [setScreen]);

  return (
    <>
      {/* Body */}
      <form
        onSubmit={onSubmitToConfirmation}
        className={cn({
          hidden: Boolean(selectPairSelector),
        })}
      >
        <Form
          onSubmit={onSubmitToConfirmation}
          isDisabled={isDisabled}
          setSelectPairSelector={setSelectPairSelector}
          setIsWalletModalOpen={setIsWalletModalOpen}
        />
      </form>

      {selectPairSelector !== null ? (
        <div className="absolute top-0 left-0 h-full w-full bg-black rounded-lg overflow-hidden">
          <FormPairSelector
            onSubmit={onSelectMint}
            tokenInfos={availableMints}
            onClose={() => setSelectPairSelector(null)}
          />
        </div>
      ) : null}
    </>
  );
};

export default InitialScreen;
