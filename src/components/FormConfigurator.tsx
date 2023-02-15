import { SwapMode } from '@jup-ag/core';
import classNames from 'classnames';
import React from 'react';
import { FormState, UseFormReset, UseFormSetValue } from 'react-hook-form';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import { FormConfigurator } from 'src/pages/_app';
import { FormProps } from 'src/types';
import Toggle from './Toggle';
import Tooltip from './Tooltip';

const templateOptions: { name: string; description: string; values: FormProps }[] = [
  {
    name: 'Default',
    description: 'Full functionality and swap experience of Terminal.',
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
    name: 'For payments',
    description: `
    Purchase a specified amount of specific token.
    e.g. Imagine paying for 1 NFT at the price of 1 SOL.
    e.g. Paying for RPC service at the price of 100 USDC.
    `,
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
  {
    name: 'Buy a project token',
    description: `To purchase a specific token.`,
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
    name: 'Exact Out',
    description: `
    On Exact Out mode, user specify the amount of token to receive instead.
    `,
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
];
const FormConfigurator = ({
  fixedInputMint,
  fixedOutputMint,
  swapMode,
  fixedAmount,
  initialAmount,
  useWalletPassthrough,

  // Hook form
  reset,
  setValue,
  formState,
}: {
  fixedInputMint: boolean;
  fixedOutputMint: boolean;
  swapMode: SwapMode;
  fixedAmount: boolean;
  initialAmount: string;
  useWalletPassthrough: boolean;

  // Hook form
  reset: UseFormReset<FormConfigurator>,
  setValue: UseFormSetValue<FormConfigurator>
  formState: FormState<FormConfigurator>
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);

  const onSelect = (index: number) => {
    const {
      swapMode,
      initialAmount,
      fixedAmount,
      initialInputMint,
      fixedInputMint,
      initialOutputMint,
      fixedOutputMint,
    } = templateOptions[index].values;
    reset({
      swapMode,
      initialAmount,
      fixedAmount,
      fixedInputMint,
      fixedOutputMint,
    })
    setActive(index);
    setIsOpen(false);
  };

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
              <div className='flex items-center justify-center space-x-2.5'>
                <p>{templateOptions[active].name}</p>
                
                <Tooltip
                  variant="dark"
                  content={
                    <pre className='text-white text-xs'>{templateOptions[active].description}</pre>
                  }>
                  <div className="flex items-center text-white-35 fill-current">
                    <InfoIconSVG width={12} height={12} />
                  </div>
                </Tooltip>

                {formState?.isDirty ? (
                  <p className='text-[10px] text-white/50 rounded-xl py-1 px-2 border border-white/50 leading-none'>
                    Custom
                  </p>
                ) : null}
              </div>

              <ChevronDownIcon />
            </button>

            {isOpen ? (
              <div
                className="absolute left-0 z-10 ml-1 mt-1 origin-top-right rounded-md shadow-xl bg-zinc-700 w-full border border-white/20"
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
                      'flex items-center w-full px-4 py-2 text-sm hover:bg-white/20 text-left',
                      active === index ? '' : '',
                      index !== templateOptions.length - 1 ? 'border-b border-white/10' : '',
                    )}
                  >
                    <span>{item.name}</span>
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
        <Toggle className="min-w-[40px]" active={fixedInputMint} onClick={() => setValue('fixedInputMint', !fixedInputMint, { shouldDirty: true })} />
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
          onClick={() => setValue('fixedOutputMint', !fixedOutputMint, { shouldDirty: true })}
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
          onClick={() => setValue('swapMode', swapMode === SwapMode.ExactIn ? SwapMode.ExactOut : SwapMode.ExactIn, { shouldDirty: true })}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Fixed amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed amount</p>
          <p className="text-xs text-white/30">Depending on Exact In / Exact Out, the amount cannot be changed</p>
        </div>
        <Toggle className="min-w-[40px]" active={fixedAmount} onClick={() => setValue('fixedAmount', !fixedAmount, { shouldDirty: true })} />
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
            setValue('initialAmount', value)
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
          onClick={() => setValue('useWalletPassthrough', !useWalletPassthrough)}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />
    </div>
  );
};

export default FormConfigurator;
