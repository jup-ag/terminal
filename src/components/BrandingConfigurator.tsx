import { UseFormSetValue } from 'react-hook-form';
import { IFormConfigurator } from 'src/constants';

interface BrandingConfiguratorProps {
  branding: IFormConfigurator['branding'];
  setValue: UseFormSetValue<IFormConfigurator>;
}

export const BrandingConfigurator = ({ branding, setValue }: BrandingConfiguratorProps) => {
  return (
    <div className="relative inline-block text-left text-white w-full mt-5">
      <p className="text-white text-sm font-semibold">Branding Configuration</p>
      <p className="text-xs text-white/50 mt-1">Customize the terminal&apos;s branding</p>

      <div className="flex justify-between mt-2">
        <div>
          <p className="text-sm text-white/75">Logo URI</p>
        </div>
      </div>
      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
        value={branding?.logoUri ?? ''}
        inputMode="text"
        onChange={(e) => {
          setValue('branding.logoUri', e.target.value);
        }}
      />

      <div className="flex justify-between mt-2">
        <div>
          <p className="text-sm text-white/75">Name</p>
        </div>
      </div>
      <input
        className="mt-2 text-white w-full flex justify-between items-center space-x-2 text-left rounded-md bg-white/10 px-4 py-2 text-sm font-medium shadow-sm border border-white/10"
        value={branding?.name ?? ''}
        inputMode="text"
        onChange={(e) => {
          setValue('branding.name', e.target.value);
        }}
      />
    </div>
  );
};
