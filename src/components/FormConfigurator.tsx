import { SwapMode } from '@jup-ag/react-hook';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { FormState, UseFormReset, UseFormSetValue } from 'react-hook-form';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import Toggle from './Toggle';
import Tooltip from './Tooltip';
import { AVAILABLE_EXPLORER } from '../contexts/preferredExplorer/index';
import { IFormConfigurator, INITIAL_FORM_CONFIG } from 'src/constants';
import { useRouter } from 'next/router';

const templateOptions: { name: string; description: string; values: IFormConfigurator }[] = [
  {
    name: 'Default',
    description: 'Full functionality and swap experience of Terminal.',
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: INITIAL_FORM_CONFIG.formProps,
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
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        swapMode: SwapMode.ExactOut,
        initialAmount: '1000000000',
        fixedAmount: true,
        fixedOutputMint: true,
      }
    },
  },
  {
    name: 'Buy a project token',
    description: `To purchase a specific token.`,
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        swapMode: SwapMode.ExactIn,
        initialOutputMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        fixedOutputMint: true,
      }
    },
  },
  {
    name: 'Exact Out',
    description: `
    On Exact Out mode, user specify the amount of token to receive instead.
    `,
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        swapMode: SwapMode.ExactOut,
      }
    },
  },
  {
    name: 'APE',
    description: `
    APE. Just APE.
    `,
    values: {
      ...INITIAL_FORM_CONFIG,
      strictTokenList: false,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        initialAmount: '8888888800000',
        fixedAmount: false,
        initialInputMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        fixedInputMint: false,
        initialOutputMint: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR',
        fixedOutputMint: true,
      }
    },
  },
];

const FormConfigurator = ({
  useWalletPassthrough,
  strictTokenList,
  defaultExplorer,
  formProps,

  // Hook form
  reset,
  setValue,
  formState,
}: IFormConfigurator & {
  // Hook form
  reset: UseFormReset<IFormConfigurator>;
  setValue: UseFormSetValue<IFormConfigurator>;
  formState: FormState<IFormConfigurator>;
}) => {
  const currentTemplate = useRef('');
  const { query, replace } = useRouter();

  useEffect(() => {
    const templateName = query?.template
    if (currentTemplate.current === templateName) return

    if (templateOptions.find(item => item.name === templateName)) {
      const index = templateOptions.findIndex(item => item.name === templateName)
      onSelect(index)
    }
  }, [query])

  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [isExplorerDropdownOpen, setIsExplorerDropdownOpen] = React.useState(false);

  const onSelect = (index: number) => {
    reset(templateOptions[index].values);

    const templateName = templateOptions[index].name;
    currentTemplate.current = templateName;

    replace({
      query: templateName === 'Default' ? undefined : {
        template: templateName
      }
    },
      undefined,
      { shallow: true })

    setActive(index);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-full border border-white/10 md:border-none md:mx-0 md:max-w-[300px] max-h-[700px] overflow-y-scroll overflow-x-hidden webkit-scrollbar bg-white/5 rounded-xl p-4">
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
              <div className="flex items-center justify-center space-x-2.5">
                <p>{templateOptions[active].name}</p>

                <Tooltip
                  variant="dark"
                  content={<div className="text-white text-xs">{templateOptions[active].description}</div>}
                >
                  <div className="flex items-center text-white-35 fill-current">
                    <InfoIconSVG width={12} height={12} />
                  </div>
                </Tooltip>

                {formState?.isDirty ? (
                  <p className="text-[10px] text-white/50 rounded-xl py-1 px-2 border border-white/50 leading-none">
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
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedInputMint}
          onClick={() => setValue('formProps.fixedInputMint', !formProps.fixedInputMint, { shouldDirty: true })}
        />
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
          active={!!formProps.fixedOutputMint}
          onClick={() => setValue('formProps.fixedOutputMint', !formProps.fixedOutputMint, { shouldDirty: true })}
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
          active={formProps.swapMode === SwapMode.ExactOut}
          onClick={() =>
            setValue('formProps.swapMode', formProps.swapMode === SwapMode.ExactIn ? SwapMode.ExactOut : SwapMode.ExactIn, {
              shouldDirty: true,
            })
          }
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Fixed amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed amount</p>
          <p className="text-xs text-white/30">Depending on Exact In / Exact Out, the amount cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedAmount}
          onClick={() => setValue('formProps.fixedAmount', !formProps.fixedAmount, { shouldDirty: true })}
        />
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
        value={formProps.initialAmount}
        inputMode="numeric"
        onChange={(e) => {
          const regex = /^[0-9\b]+$/;
          const value = e.target.value;
          if (value === '' || regex.test(value)) {
            setValue('formProps.initialAmount', value);
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

      {/* Strict Token List  */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Strict Token List</p>
          <p className="text-xs text-white/30">{`The strict list contains a smaller set of validated tokens. To see all tokens, toggle "off".`}</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={strictTokenList}
          onClick={() => setValue('strictTokenList', !strictTokenList)}
        />
      </div>
      <div className="w-full border-b border-white/10 py-3" />

      {/* Preferred Explorer  */}
      <div className="relative inline-block text-left text-white w-full mt-5">
        <p className="text-white text-sm font-semibold">Preferred Explorer</p>

        <div className="mt-4">
          <button
            onClick={() => setIsExplorerDropdownOpen(!isExplorerDropdownOpen)}
            type="button"
            className="w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <div className='flex items-center justify-center space-x-2.5'>
              <p>{Object.values(AVAILABLE_EXPLORER).find(item => item.name === defaultExplorer)?.name}</p>
            </div>

            <ChevronDownIcon />
          </button>

          {isExplorerDropdownOpen ? (
            <div
              className="absolute left-0 bottom-6 z-10 ml-1 mt-1 origin-top-right rounded-md shadow-xl bg-zinc-700 w-full border border-white/20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              {AVAILABLE_EXPLORER.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue('defaultExplorer', item.name)
                    setIsExplorerDropdownOpen(false);
                  }}
                  type="button"
                  className={classNames(
                    'flex items-center w-full px-4 py-2 text-sm hover:bg-white/20 text-left',
                    active === index ? '' : '',
                    index !== AVAILABLE_EXPLORER.length - 1 ? 'border-b border-white/10' : '',
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
  );
};

export default FormConfigurator;
