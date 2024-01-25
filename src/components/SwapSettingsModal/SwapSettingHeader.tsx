import React from 'react';
import CloseIcon from 'src/icons/CloseIcon';

interface Props {
  onClose: VoidFunction;
  tooltip?: JSX.Element;
  title: string;
}

export const SwapSettingHeader: React.FC<Props> = (props: Props) => {
  const { onClose, tooltip, title } = props;
  return (
    <div className="flex justify-between items-center p-4 pl-5 border-b border-white/10">
      <div className="text-sm font-semibold flex-column flex items-center">
        <span>{title}</span>
        {tooltip}
      </div>
      <div className="text-white fill-current cursor-pointer" onClick={onClose}>
        <CloseIcon width={14} height={14} />
      </div>
    </div>
  );
};
