import React, { useCallback, useState } from 'react';

import { useSwapContext } from 'src/contexts/SwapContext';
import Form from '../../components/Form';
import FormPairSelector from '../../components/FormPairSelector';
import { cn } from 'src/misc/cn';
import { Asset } from 'src/entity/SearchResponse';

const InitialScreen = () => {
  const { form, setForm, loading } = useSwapContext();

  const [isDisabled, setIsDisabled] = useState(false);

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

  return (
    <>
      {/* Body */}
      <form
        className={cn({
          hidden: Boolean(selectPairSelector),
        })}
      >
        <Form isDisabled={isDisabled} setSelectPairSelector={setSelectPairSelector} />
      </form>

      {selectPairSelector !== null ? (
        <div className="absolute top-0 left-0 h-full w-full bg-black rounded-lg overflow-hidden">
          <FormPairSelector onSubmit={onSelectMint} onClose={() => setSelectPairSelector(null)} />
        </div>
      ) : null}
    </>
  );
};

export default InitialScreen;
