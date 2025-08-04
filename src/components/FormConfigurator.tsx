import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useFormContext,
  useWatch,
} from 'react-hook-form';
import ChevronDownIcon from 'src/icons/ChevronDownIcon';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import Toggle from './Toggle';
import Tooltip from './Tooltip';
import ColorConfiguration from './ColorConfiguration';
import { AVAILABLE_EXPLORER } from '../contexts/preferredExplorer/index';
import { IFormConfigurator, INITIAL_FORM_CONFIG, WRAPPED_SOL_MINT } from 'src/constants';
import { useRouter } from 'next/router';
import { base64ToJson, isValidSolanaAddress } from 'src/misc/utils';
import { cn } from 'src/misc/cn';
import { SwapMode } from 'src/types/constants';
import Link from 'next/link';
import { BrandingConfigurator } from './BrandingConfigurator';

const templateOptions: { name: string; description: string; values: IFormConfigurator }[] = [
  {
    name: 'Default',
    description: 'Full functionality and swap experience of Plugin.',
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: { ...INITIAL_FORM_CONFIG.formProps },
    },
  },
  {
    name: 'Pro',
    description: `
    APE. Just APE.
    `,
    values: {
      ...INITIAL_FORM_CONFIG,
      formProps: {
        ...INITIAL_FORM_CONFIG.formProps,
        fixedAmount: false,
        fixedMint: WRAPPED_SOL_MINT.toString(),
      },
    },
  },
];

function applyCustomColors(colors: {
  primary?: string;
  background?: string;
  primaryText?: string;
  warning?: string;
  interactive?: string;
  module?: string;
}) {
  const root = document.documentElement;

  if (colors.primary) {
    root.style.setProperty('--jupiter-plugin-primary', colors.primary);
  }
  if (colors.background) {
    root.style.setProperty('--jupiter-plugin-background', colors.background);
  }
  if (colors.primaryText) {
    root.style.setProperty('--jupiter-plugin-primary-text', colors.primaryText);
  }
  if (colors.warning) {
    root.style.setProperty('--jupiter-plugin-warning', colors.warning);
  }
  if (colors.interactive) {
    root.style.setProperty('--jupiter-plugin-interactive', colors.interactive);
  }
  if (colors.module) {
    root.style.setProperty('--jupiter-plugin-module', colors.module);
  }
}

const FormConfigurator = () => {
  const { control , reset, setValue, formState} = useFormContext<IFormConfigurator>();
  const currentTemplate = useRef('');
  const { query, replace } = useRouter();

  const [isImported, setIsImported] = useState(false);

  const formProps = useWatch({ control, name: 'formProps' });
  const simulateWalletPassthrough = useWatch({ control, name: 'simulateWalletPassthrough' });
  const defaultExplorer = useWatch({ control, name: 'defaultExplorer' });
  const colors = useWatch({ control, name: 'colors' });
  const branding = useWatch({ control, name: 'branding' });
  // Apply custom colors when they change
  useEffect(() => {
    if (colors) {
      applyCustomColors(colors);
    }
  }, [colors]);
  const onSelect = useCallback(
    (index: number) => {
      reset(templateOptions[index].values);

      const templateName = templateOptions[index].name;
      currentTemplate.current = templateName;

      console.log('templateName', templateName);
      replace(
        {
          query:
            templateName === 'Default'
              ? undefined
              : {
                  template: templateName,
                },
        },
        undefined,
        { shallow: true },
      );

      setActive(index);
      setIsOpen(false);
    },
    [replace, reset],
  );

  // Initial pre-populate
  const prepopulated = useRef(false);
  useEffect(() => {
    const templateString = query?.import;
    if (templateString) {
      const data = base64ToJson(templateString as string);

      if (!data) {
        replace({ query: undefined });
        return;
      }

      reset({
        ...formState.defaultValues,
        ...data,
      });
      setIsImported(true);
      return;
    }

    const templateName = query?.template;
    if (currentTemplate.current === templateName) return;

    const foundIndex = templateOptions.findIndex((item) => item.name === templateName);
    if (foundIndex >= 0 && !prepopulated.current) {
      prepopulated.current = true;
      onSelect(foundIndex);
    }
  }, [formState.defaultValues, onSelect, query, replace, reset]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [isExplorerDropdownOpen, setIsExplorerDropdownOpen] = React.useState(false);
  const [isSwapModeOpen, setIsSwapModeOpen] = React.useState(false);

  const isValidReferralAccount = useMemo(() => {
    if (!formProps.referralAccount) return false;
    return isValidSolanaAddress(formProps.referralAccount);
  }, [formProps.referralAccount]);

  const isValidInputMint = useMemo(() => {
    if (!formProps.initialInputMint) return false;
    return isValidSolanaAddress(formProps.initialInputMint);
  }, [formProps.initialInputMint]);
  
  
  const isValidOutputMint = useMemo(() => {
    if (!formProps.initialOutputMint) return false;
    return isValidSolanaAddress(formProps.initialOutputMint);
  }, [formProps.initialOutputMint]);

  const isFixedMintIsInAndOut =
    formProps.fixedMint === formProps.initialInputMint || formProps.fixedMint === formProps.initialOutputMint;
  return (
    <div className="w-full max-w-full border border-white/10 md:border-none md:mx-0 overflow-y-scroll overflow-x-hidden webkit-scrollbar bg-white/10 rounded-xl p-4">
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
                <p>{isImported ? `Imported` : templateOptions[active].name}</p>

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
                className="absolute left-0 z-10 ml-1 mt-1 origin-top-right rounded-md shadow-xl bg-interactive w-full border border-interactive/60"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
              >
                {templateOptions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(index)}
                    type="button"
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm hover:bg-interactive/60 text-left',
                      active === index ? '' : '',
                      index !== templateOptions.length - 1 ? 'border-b border-interactive/10' : '',
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
      <div className="w-full border-b border-white/10 py-3" />
      <p className="text-white mt-6 text-sm font-semibold">Things you can configure</p>

      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Initial input mint</p>
        </div>
      
      </div>
      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
        value={formProps.initialInputMint}
        inputMode="text"
        onChange={(e) => {
          setValue('formProps.initialInputMint', e.target.value);
        }}
      />
  {!isValidInputMint && (
          <p className="text-xs text-utility-warning-300 mt-2">Invalid input mint</p>
        )}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Initial output mint</p>
        </div>

      </div>
      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
        value={formProps.initialOutputMint}
        inputMode="text"
        onChange={(e) => {
          setValue('formProps.initialOutputMint', e.target.value);
        }}
      />
        {!isValidOutputMint && (
          <p className="text-xs text-utility-warning-300 mt-2">Invalid output mint</p>
        )}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed Mint</p>
          <p className="text-xs text-white/50">Mint that fixed is fixed and cannot be changed</p>
        </div>
      </div>
      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
        value={formProps.fixedMint}
        inputMode="text"
        onChange={(e) => {
          setValue('formProps.fixedMint', e.target.value);
        }}
      />
      {formProps.fixedMint && !isFixedMintIsInAndOut && (
        <p className="text-xs text-utility-warning-300 mt-2">
          Fixed mint must match either initial input or output mint
        </p>
      )}

      {/* Exact out */}
      <div className="relative inline-block text-left text-white w-full mt-5">
        <p className="text-white/75 text-sm font-semibold">Exact output mode</p>
        <div className="text-xs text-white/30">
          {formProps.swapMode === 'ExactInOrOut' && (
            <span>User can freely switch between ExactIn or ExactOut mode.</span>
          )}
          {formProps.swapMode === 'ExactIn' && <span>User can only edit input.</span>}
          {formProps.swapMode === 'ExactOut' && <span>User can only edit exact amount received.</span>}
        </div>

        <div className="mt-2">
          <button
            onClick={() => setIsSwapModeOpen((prev) => !prev)}
            type="button"
            className=" w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            <div className="flex items-center justify-center space-x-2.5  h-5">
              <p>{formProps.swapMode}</p>
            </div>

            <ChevronDownIcon />
          </button>

          {isSwapModeOpen ? (
            <div
              className="absolute left-0 top-15 z-10 ml-1 mt-1 origin-top-right rounded-md shadow-xl bg-zinc-700 w-full border border-white/20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              {Object.values(SwapMode).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setValue('formProps.swapMode', item);
                    setIsSwapModeOpen(false);
                  }}
                  type="button"
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-sm hover:bg-interactive/60 text-left',
                    active === index ? '' : '',
                    'last:border-b last:border-white/10',
                  )}
                >
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {/* Fixed amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Fixed amount</p>
          <p className="text-xs text-white/50">Depending on Exact In / Exact Out, the amount cannot be changed</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={!!formProps.fixedAmount}
          onClick={() => setValue('formProps.fixedAmount', !formProps.fixedAmount, { shouldDirty: true })}
        />
      </div>

      {/* Initial Amount */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Initial amount (Lamport)</p>
          <p className="text-xs text-white/50">Amount to be prefilled on first load</p>
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

      {/* Referral  */}
      <div className="flex justify-between flex-col gap-y-2">
        <p className="text-white text-sm font-semibold mt-5 ">Referral</p>
        <Link
          target="_blank"
          shallow
          href="https://dev.jup.ag/docs/ultra-api/add-fees-to-ultra"
          className="text-xs text-white/40 underline hover:text-white/50"
        >
          Guide to create Referral Account
        </Link>

        <div className="flex justify-between flex-col">
          <p className="text-sm text-white/75">Referral account</p>
          <input
            className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
            value={formProps.referralAccount}
            inputMode="numeric"
            onChange={(e) => {
              setValue('formProps.referralAccount', e.target.value);
            }}
          />
          {formProps.referralAccount && !isValidReferralAccount && (
            <p className="text-xs text-utility-warning-300 mt-2">Invalid referral account</p>
          )}
        </div>
        <div className="flex justify-between flex-col">
          <p className="text-sm text-white/75">Referral fee (bps)</p>
          <input
            className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
            value={formProps.referralFee}
            placeholder="Between 50 and 255"
            inputMode="numeric"
            onChange={(e) => {
              const regex = /^[0-9\b]+$/;
              const value = e.target.value;
              if (value === '' || regex.test(value)) {
                setValue('formProps.referralFee', Number(value));
              }
            }}
          />
        </div>
      </div>
      <div className="w-full border-b border-white/10 py-3" />
      {/* Wallet passthrough */}
      <div className="flex justify-between mt-5">
        <div>
          <p className="text-sm text-white/75">Simulate wallet passthrough</p>
          <p className="text-xs text-white/50">Simulate Plugin with a fake wallet passthrough</p>
          <p className="text-xs text-white/50">(Testing available on Desktop only)</p>
        </div>
        <Toggle
          className="min-w-[40px]"
          active={simulateWalletPassthrough}
          onClick={() => setValue('simulateWalletPassthrough', !simulateWalletPassthrough)}
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
            <div className="flex items-center justify-center space-x-2.5">
              <p>{Object.values(AVAILABLE_EXPLORER).find((item) => item.name === defaultExplorer)?.name}</p>
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
                    setValue('defaultExplorer', item.name);
                    setIsExplorerDropdownOpen(false);
                  }}
                  type="button"
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-sm hover:bg-interactive/60 text-left',
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
      <div className="w-full border-b border-white/10 py-3" />

      <BrandingConfigurator branding={branding} setValue={setValue} />
      <div className="w-full border-b border-white/10 py-3" />
      <ColorConfiguration colors={colors} setValue={setValue} />
    </div>
  );
};

export default FormConfigurator;
