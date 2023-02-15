import { SwapMode } from '@jup-ag/core';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import { FormProps } from 'src/types';
import Toggle from './Toggle';

const templateOptions: { name: string; values: FormProps }[] = [
  {
    name: 'Default',
    values: {
      swapMode: SwapMode.ExactIn,
      initialAmount: '',
      fixedAmount: false,
      initialInputMint: '',
      fixedInputMint: false,
      initialOutputMint: '',
      fixedOutputMint: false,
    },
  },
  {
    name: 'Only allowed to buy specific token',
    values: {
      swapMode: SwapMode.ExactIn,
      initialAmount: '',
      fixedAmount: false,
      initialInputMint: '',
      fixedInputMint: false,
      initialOutputMint: '',
      fixedOutputMint: true,
    },
  },
  {
    name: 'Specify desired output amount (ExactOut)',
    values: {
      swapMode: SwapMode.ExactOut,
      initialAmount: '',
      fixedAmount: false,
      initialInputMint: '',
      fixedInputMint: false,
      initialOutputMint: '',
      fixedOutputMint: false,
    },
  },
  {
    name: 'To Pay for NFT',
    values: {
      swapMode: SwapMode.ExactOut,
      initialAmount: '1000000000',
      fixedAmount: true,
      initialInputMint: '',
      fixedInputMint: false,
      initialOutputMint: '',
      fixedOutputMint: true,
    },
  },
];
const FormConfigurator = ({
  fixedInputMint,
  setFixedInputMint,
  fixedOutputMint,
  setFixedOutputMint,
  swapMode,
  setSwapMode,
  fixedAmount,
  setFixedAmount,
  initialAmount,
  setInitialAmount,
  useWalletPassthrough,
  setUseWalletPassthrough,
}: {
  fixedInputMint: boolean;
  setFixedInputMint: React.Dispatch<React.SetStateAction<boolean>>;
  fixedOutputMint: boolean;
  setFixedOutputMint: React.Dispatch<React.SetStateAction<boolean>>;
  swapMode: SwapMode;
  setSwapMode: React.Dispatch<React.SetStateAction<SwapMode>>;
  fixedAmount: boolean;
  setFixedAmount: React.Dispatch<React.SetStateAction<boolean>>;
  initialAmount: string;
  setInitialAmount: React.Dispatch<React.SetStateAction<string>>;
  useWalletPassthrough: boolean;
  setUseWalletPassthrough: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);

  const onSelect = (index: number) => {
    setActive(index);
    setIsOpen(false);
  };

  useEffect(() => {
    const {
      swapMode,
      initialAmount,
      fixedAmount,
      initialInputMint,
      fixedInputMint,
      initialOutputMint,
      fixedOutputMint,
    } = templateOptions[active].values;

    if (typeof swapMode !== 'undefined') {
      setSwapMode(swapMode)
    }
    if (typeof initialAmount !== 'undefined') {
      setInitialAmount(initialAmount)
    }
    if (typeof fixedAmount !== 'undefined') {
      setFixedAmount(fixedAmount)
    }
    // if (typeof initialInputMint !== 'undefined') {
    //   setInitialInputMint(initialInputMint)
    // }
    if (typeof fixedInputMint !== 'undefined') {
      setFixedInputMint(fixedInputMint)
    }
    // if (typeof initialOutputMint !== 'undefined') {
    //   setInitialOutputMint(initialOutputMint)
    // }
    if (typeof fixedOutputMint !== 'undefined') {
      setFixedOutputMint(fixedOutputMint)
    }
  }, [active]);

  return (
    <div className="w-full max-w-full md:max-w-[300px] bg-white/5 rounded-xl p-4">
      <div className="w-full">
        <div className="relative inline-block text-left text-white w-full">
          <p className="text-white text-sm font-semibold">Template</p>

          <div className="mt-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
              id="menu-button"
              aria-expanded="true"
              aria-haspopup="true"
            >
              <p>{templateOptions[active].name}</p>
              <ChevronDownIcon />
            </button>

            {isOpen ? (
              <div
                className="absolute left-0 z-10 ml-1 mt-1 origin-top-right rounded-md overflow-hidden shadow-xl bg-zinc-700 w-full border border-white/20"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
              >
                {templateOptions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(index)}
                    type="button"
                    className={classNames(
                      'w-full block px-4 py-2 text-sm hover:bg-white/20 text-left',
                      active === index ? '' : '',
                      index !== templateOptions.length - 1 ? 'border-b border-white/10' : '',
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-white mt-8 text-sm font-semibold">Things you can configure</p>

      {/* Fixed input */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed input mint</p>
          <p className="text-xs text-white/30">Input mint cannot be changed</p>
        </div>
        <Toggle className="min-w-[40px]" active={fixedInputMint} onClick={() => setFixedInputMint(!fixedInputMint)} />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Fixed output */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed output mint</p>
          <p className="text-xs text-white/30">Output mint cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={fixedOutputMint}
          onClick={() => setFixedOutputMint(!fixedOutputMint)}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Exact out */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Exact output mode</p>
          <p className="text-xs text-white/30">Specify output instead of input</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={swapMode === SwapMode.ExactOut}
          onClick={() => setSwapMode(swapMode === SwapMode.ExactIn ? SwapMode.ExactOut : SwapMode.ExactIn)}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Fixed amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed amount</p>
          <p className="text-xs text-white/30">Depending on Exact In / Exact Out, the amount cannot be changed</p>
        </div>
        <Toggle className="min-w-[40px]" active={fixedAmount} onClick={() => setFixedAmount(!fixedAmount)} />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Initial Amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Initial amount</p>
          <p className="text-xs text-white/30">Amount to be prefilled on first load</p>
        </div>
      </div>
      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
        value={initialAmount}
        inputMode="numeric"
        onChange={(e) => {
          const regex = /^[0-9\b]+$/;
          const value = e.target.value;
          if (value === '' || regex.test(value)) {
            setInitialAmount(value);
          }
        }}
      />
      <div className="w-full border-b border-white/10 py-3" />

      {/* Wallet passthrough */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Simulate wallet passthrough</p>
          <p className="text-xs text-white/30">Simulate Terminal with a fake wallet passthrough</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={useWalletPassthrough}
          onClick={() => setUseWalletPassthrough(!useWalletPassthrough)}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />
    </div>
  );
};

export default FormConfigurator;
