import React from 'react';
import { cn } from 'src/misc/cn';

const IconSwitchPairDark = () => (
  <svg width={20} height={20} viewBox="0 0 21 22" fill="white" fillOpacity={0.5} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.51043 7.47998V14.99H7.77043V7.47998L9.66043 9.36998L10.5505 8.47994L7.5859 5.51453C7.3398 5.26925 6.94114 5.26925 6.69504 5.51453L3.73047 8.47994L4.62051 9.36998L6.51043 7.47998Z"
      fill="white"
    />
    <path
      d="M14.4902 14.52V7.01001H13.2302V14.52L11.3402 12.63L10.4502 13.5201L13.4148 16.4855C13.6609 16.7308 14.0595 16.7308 14.3056 16.4855L17.2702 13.5201L16.3802 12.63L14.4902 14.52Z"
      fill="white"
    />
  </svg>
);

const SwitchPairButton = ({
  className,
  onClick,
  disabled,
}: {
  className?: string;
  onClick(): void;
  disabled?: boolean;
}) => {
  return (
    <div className="flex justify-center bg-background rounded-full">
      <div
        onClick={onClick}
        className={cn(
          'border-[3px] border-background fill-current text-black bg-interactive hover:bg-interactive/80 dark:text-primary-text-35  dark:hover:border-primary dark:border dark:border-white-35 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer',
          className,
          {
            'opacity-50 cursor-not-allowed': disabled,
          },
        )}
      >
        <IconSwitchPairDark />
      </div>
    </div>
  );
};

export default SwitchPairButton;
