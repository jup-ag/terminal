
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useScreenState } from 'src/contexts/ScreenProvider';
import { useSwapContext } from 'src/contexts/SwapContext';
import Form from '../../components/Form';
import FormPairSelector from '../../components/FormPairSelector';
import Decimal from 'decimal.js';
import { cn } from 'src/misc/cn';
import { useBalances } from 'src/hooks/useBalances';
import { Asset } from 'src/entity/SearchResponse';
import { useAsset } from 'src/hooks/useAsset';

const InitialScreen = () => {
  const { data: balances } = useBalances();

  const {
    form,
    setForm,
    setErrors,
    quoteResponseMeta,
    loading,
  } = useSwapContext();
  const { setScreen } = useScreenState();

  const balance = useMemo(() => {
    if (!balances) return 0;
    return balances[form.fromMint]?.uiAmount || 0;
  }, [balances, form.fromMint]);

  const [isDisabled, setIsDisabled] = useState(false);

  const { data: asset } = useAsset(form.fromMint);

  useEffect(() => {
    if (!form.fromValue || !form.fromMint || !form.toMint || !form.toValue || !quoteResponseMeta || loading) {
      setErrors({});
      setIsDisabled(true);
      return;
    }

    if (new Decimal(form.fromValue).gt(balance)) {
      setErrors({
        fromValue: { title: `Insufficient ${asset?.symbol}`, message: '' },
      });
      setIsDisabled(true);
      return;
    }

    setErrors({});
    setIsDisabled(false);
  }, [form, asset, balance, quoteResponseMeta, loading, setErrors]);

  const [selectPairSelector, setSelectPairSelector] = useState<'fromMint' | 'toMint' | null>(null);

  const onSelectMint = useCallback(
    async (tokenInfo: Asset) => {
      if (selectPairSelector === 'fromMint') {
        setForm((prev) => ({
          ...prev,
          fromMint: tokenInfo.id,
          fromValue: '',
          // Prevent same token to same token;
          ...(prev.toMint === tokenInfo.id ? { toMint: prev.fromMint } : undefined),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          toMint: tokenInfo.id,
          toValue: '',
          // Prevent same token to same token;
          ...(prev.fromMint === tokenInfo.id ? { fromMint: prev.toMint } : undefined),
        }));
      }
      setSelectPairSelector(null);
    },
    [selectPairSelector, setForm],
  );

  
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
        />
      </form>

      {selectPairSelector !== null ? (
        <div className="absolute top-0 left-0 h-full w-full bg-black rounded-lg overflow-hidden">
          <FormPairSelector
            onSubmit={onSelectMint}
            onClose={() => setSelectPairSelector(null)}
          />
        </div>
      ) : null}
    </>
  );
};

export default InitialScreen;
