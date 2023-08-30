import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { ParsedEscrow, useSwapContext } from 'src/contexts/SwapContext';
import { useTokenContext } from 'src/contexts/TokenContextProvider';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import ChevronLeftIcon from 'src/icons/ChevronLeftIcon';
import CloseIcon from 'src/icons/CloseIcon';
import TokenIcon from '../TokenIcon';
import Decimal from 'decimal.js';
import Spinner from '../Spinner';

const DCAItem: React.FC<{ item: ParsedEscrow }> = ({ item }) => {
  const { tokenMap } = useTokenContext();
  const { onClose } = useSwapContext();

  const inputMint = useMemo(() => item.parsed?.account.inputMint, [item]);
  const outputMint = useMemo(() => item.parsed?.account.outputMint, [item]);
  const inputTokenInfo = useMemo(() => (inputMint ? tokenMap.get(inputMint.toString()) : null), [item]);
  const outputTokenInfo = useMemo(() => (outputMint ? tokenMap.get(outputMint.toString()) : null), [item]);

  const initialDeposited = useMemo(
    () => new Decimal(item.parsed?.account.inDeposited.toString() || 0).div(10 ** (inputTokenInfo?.decimals || 0)),
    [item],
  );
  const outputAmount = useMemo(
    () => new Decimal(item.parsed?.account.outReceived.toString() || 0).div(10 ** (outputTokenInfo?.decimals || 0)),
    [item],
  );

  const [isClosing, setIsClosing] = useState(false);
  const onCloseDCA = async () => {
    if (!inputMint || !outputMint) return;

    try {
      setIsClosing(true);
      await onClose(item.account.dca, item.publicKey, inputMint, outputMint);
    } catch (error) {
      console.error(error);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div
      key={item.publicKey.toString()}
      className={classNames('mt-2 border border-white/10 rounded-lg p-2 text-xs flex justify-between items-center')}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center -space-x-1">
            <TokenIcon tokenInfo={inputTokenInfo} />
            <TokenIcon tokenInfo={outputTokenInfo} />
          </div>
          <span className="font-semibold">{item.parsed?.state === 'active' ? 'Ongoing' : 'Finished'}</span>
        </div>

        <span>
          Deposited: {initialDeposited.toString()} {inputTokenInfo?.symbol}
        </span>
        <span>
          Bought: {outputAmount.toString()} {outputTokenInfo?.symbol}
        </span>
      </div>

      {item.parsed?.state === 'finished' ? (
        <div className="text-white/50">
          <button
            disabled={isClosing}
            type="button"
            className="px-2 py-1 border border-white/20 rounded-lg"
            onClick={onCloseDCA}
          >
            {isClosing ? (
              <div className="flex space-x-1 fill-current">
                <span>Closing...</span>
                <Spinner />
              </div>
            ) : (
              'Close'
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};

const DCAList: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const {
    dca: { escrows },
  } = useSwapContext();

  return (
    <div className={classNames('w-full rounded-xl flex flex-col bg-jupiter-bg text-white shadow-xl max-h-[90%]')}>
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="text-sm font-semibold">
          <span>Ongoing DCA</span>
        </div>
        <div className="text-white fill-current cursor-pointer" onClick={() => closeModal()}>
          <CloseIcon width={14} height={14} />
        </div>
      </div>

      <div className={classNames('relative w-full overflow-y-auto webkit-scrollbar p-2')}>
        <div>
          {escrows?.map((item) => (
            <DCAItem key={item.publicKey.toString()} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

const OngoingDCA = () => {
  const { wallet } = useWalletPassThrough();
  const {
    dca: { escrows },
  } = useSwapContext();

  const [showOngoingDCA, setShowOngoingDCA] = useState(false);

  if (!wallet?.adapter.publicKey || (escrows?.length || 0) === 0) return null;

  return (
    <>
      <div className="px-4 py-2" onClick={() => setShowOngoingDCA(true)}>
        <div className="border border-black/10 shadow-xl bg-white/5 font-semibold text-white text-xs rounded-lg py-2 px-3 flex justify-between hover:bg-white/10 cursor-pointer">
          <span>You have {escrows?.length} ongoing DCA plans.</span>
          <div className="rotate-180 text-white/20 fill-current flex items-center">
            <ChevronLeftIcon width={10} height={10} />
          </div>
        </div>
      </div>

      {showOngoingDCA ? (
        <div className="absolute z-10 top-0 left-0 w-full h-full overflow-hidden bg-black/50 flex items-center px-4">
          <DCAList closeModal={() => setShowOngoingDCA(false)} />
        </div>
      ) : null}
    </>
  );
};

export default OngoingDCA;
