import React, { useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import ColorPicker from './ColorPicker';
import { IFormConfigurator } from 'src/constants';

interface ColorConfigurationProps {
  colors: {
    primary?: string;
    background?: string;
    primaryText?: string;
    warning?: string;
    interactive?: string;
    module?: string;
  };
  setValue: UseFormSetValue<IFormConfigurator>;
}

const ColorConfiguration: React.FC<ColorConfigurationProps> = ({ colors, setValue }) => {
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  const colorConfigs = [
    {
      key: 'primary',
      label: 'Primary Color',
    },
    {
      key: 'background',
      label: 'Background Color',
    },
    {
      key: 'primaryText',
      label: 'Primary Text Color',
    },
    {
      key: 'warning',
      label: 'Warning Color',
    },
    {
      key: 'interactive',
      label: 'Interactive Color',
    },
    {
      key: 'module',
      label: 'Module Color',
    },
  ];

  return (
    <div className="relative inline-block text-left text-white w-full mt-5">
      <p className="text-white text-sm font-semibold">Color Configuration</p>
      <p className="text-xs text-white/50 mt-1">Customize the terminal&apos;s color scheme</p>

      {colorConfigs.map((config) => (
        <ColorPicker
          key={config.key}
          label={config.label}
          colorKey={config.key}
          currentColor={colors[config.key as keyof typeof colors] || ''}
          isActive={activeColorPicker === config.key}
          setIsActive={(isActive: boolean) => {
            setActiveColorPicker(isActive ? config.key : null);
          }}
          setValue={
            (rgb: string) => {
              setValue('colors', {
                ...colors,
                [config.key]: rgb
              });
            }
          }
        />
      ))}
    </div>
  );
};

export default ColorConfiguration; 