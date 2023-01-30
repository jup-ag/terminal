import React, { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import classNames from 'classnames';

import GlassBox from '../GlassBox/GlassBox';

import SwapSettingButton from './SwapSettingButton';
import CloseIcon from 'src/icons/CloseIcon';
import { DEFAULT_SLIPPAGE, useSlippageConfig } from 'src/contexts/SlippageConfigProvider';
import { detectedSeparator, formatNumber } from 'src/misc/utils';
import JupInputContainer from './JupInputContainer';
import JupButton from '../JupButton';
import Toggle from '../Toggle';
import { useSwapContext } from 'src/contexts/SwapContext';

const Separator = () => <div className="mt-4 border-b border-white/10" />;

export type Forms = {
  slippagePreset?: string;
  slippageInput?: string;
};

const MINIMUM_SLIPPAGE = 0;
const MAXIMUM_SLIPPAGE = 50; // 50%
const MINIMUM_SUGGESTED_SLIPPAGE = 0.05; // 0.05%
const MAXIMUM_SUGGESTED_SLIPPAGE = 10; // 10%

const SetSlippage: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const { slippage, setSlippage } = useSlippageConfig();
  const { jupiter: { asLegacyTransaction, setAsLegacyTransaction } } = useSwapContext();

  const SLIPPAGE_PRESET = useMemo(() => ['0.1', String(DEFAULT_SLIPPAGE), '1.0'], [DEFAULT_SLIPPAGE]);

  const slippageInitialPreset = useMemo(() => {
    return SLIPPAGE_PRESET.find((preset) => Number(preset) === slippage);
  }, [slippage]);

  const form = useForm<Forms>({
    defaultValues: {
      ...(slippage
        ? slippageInitialPreset
          ? {
              slippagePreset: String(slippageInitialPreset),
            }
          : {
              slippageInput: String(slippage),
            }
        : {}),
    },
  });

  const [inputFocused, setInputFocused] = useState(!slippageInitialPreset);

  const slippageInput = form.watch('slippageInput');
  const slippagePreset = form.watch('slippagePreset');
  const isWithinSlippageLimits = useMemo(() => {
    return Number(slippageInput) >= MINIMUM_SLIPPAGE && Number(slippageInput) <= MAXIMUM_SLIPPAGE;
  }, [slippageInput]);
  const isDisabled = useMemo(() => {
    if (slippagePreset) {
      return false;
    }

    if (inputFocused) {
      return !isWithinSlippageLimits;
    }

    return !form.formState.isDirty;
  }, [slippageInput, slippagePreset]);

  const slippageSuggestionText = useMemo(() => {
    if (Number(slippageInput) <= MINIMUM_SUGGESTED_SLIPPAGE) {
      return <p>Your transaction may fail</p>;
    }

    if (Number(slippageInput) >= MAXIMUM_SUGGESTED_SLIPPAGE) {
      return <p>Warning, slippage is high</p>;
    }

    return '';
  }, [slippageInput]);

  const inputRef = useRef<HTMLInputElement>();

  return (
    <GlassBox className={classNames('!bg-jupiter-bg text-white shadow-xl ')}>
      <form
        onSubmit={form.handleSubmit((value) => {
          const slippage = Number(value.slippageInput ?? value.slippagePreset);
          if (typeof slippage === 'number') {
            setSlippage(slippage);
            closeModal();
          }
        })}
        className={'relative w-full'}
      >
        <div className="absolute right-4 top-4">
          <div className="text-white fill-current cursor-pointer" onClick={() => closeModal()}>
            <CloseIcon />
          </div>
        </div>

        <div className='mt-2'>
          <div className="px-5 py-2">
            <p className='text-sm font-semibold'>Slippage Settings</p>

            <div className="flex items-center space-x-2 mt-3">
              <Controller
                name="slippagePreset"
                control={form.control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <>
                      {SLIPPAGE_PRESET.map((item, idx) => {
                        const displayText = formatNumber.format(Number(item)) + '%';

                        return (
                          <SwapSettingButton
                            key={idx}
                            highlighted={!inputFocused && Number(value) === Number(item)}
                            onClick={() => {
                              onChange(item);
                              setInputFocused(false);
                              form.setValue('slippageInput', undefined);
                            }}
                          >
                            {displayText}
                          </SwapSettingButton>
                        );
                      })}
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div className="px-5 pb-5 mt-2">
            <JupInputContainer
              highlighted={inputFocused}
              onClick={() => inputRef.current?.focus()}
              className="flex items-center h-16"
            >
              <div className="absolute left-4 pointer-events-none text-xs text-white-50">
                <p>Custom slippage</p>
              </div>

              <Controller
                name={'slippageInput'}
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <NumericFormat
                    value={value}
                    decimalScale={2}
                    isAllowed={(value) => {
                      // This is for onChange events, we dont care about Minimum slippage here, to allow more natural inputs
                      return (value.floatValue || 0) <= 100 && (value.floatValue || 0) >= 0;
                    }}
                    getInputRef={(el: HTMLInputElement) => (inputRef.current = el)}
                    allowNegative={false}
                    onValueChange={({ floatValue }) => {
                      onChange(floatValue);
                      setInputFocused(true);
                      form.setValue('slippagePreset', undefined);
                    }}
                    allowLeadingZeros={false}
                    valueIsNumericString
                    suffix="%"
                    className="h-full w-full bg-transparent py-4 px-5 text-base font-semibold rounded-lg text-white-50 text-right pointer-events-all"
                    decimalSeparator={detectedSeparator}
                    placeholder={detectedSeparator === ',' ? '0,00%' : '0.00%'}
                  />
                )}
              />
            </JupInputContainer>

            {inputFocused && !isWithinSlippageLimits && (
              <div className="mt-2 text-xs">
                {`Please set a slippage value that is within ${MINIMUM_SLIPPAGE}% to ${MAXIMUM_SLIPPAGE}%`}
              </div>
            )}

            {slippageSuggestionText && <div className="mt-2 text-xs">{slippageSuggestionText}</div>}

            <JupButton type="submit" className={'w-full mt-4'} disabled={isDisabled} size={'lg'}>
              <span>Save slippage</span>
            </JupButton>

            <Separator />

            <div className='flex items-center justify-between mt-5'>
              <p className='text-sm font-semibold'>Versioned Tx.</p>
              <Toggle
                className="!w-10 !h-[22px] !p-[1px]"
                dotClassName="!w-[18px] !h-[18px]"
                active={!asLegacyTransaction}
                onClick={() => setAsLegacyTransaction(!asLegacyTransaction)}
              />
            </div>
            <p className='mt-2 text-xs text-white/50'>
              Versioned Tx is a significant upgrade that allows for more advanced routings and better prices! Make
              sure your connected wallet is compatible before toggling on Ver. Tx. Current compatible wallets:
              Phantom, Solflare, Glow and Backpack.
            </p>
          </div>
        </div>
      </form>
    </GlassBox>
  );
};

export default SetSlippage;
