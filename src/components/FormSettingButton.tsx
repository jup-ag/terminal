import React from 'react';

export const FormSettingButton: React.FC<{ onClick: VoidFunction; children: React.ReactNode }> = ({
  onClick,
  children,
}) => {
  return (
    <button
      type="button"
      className="p-2 h-7 space-x-1 flex items-center justify-center border rounded-2xl border-white/10 bg-black/10 text-white/30 fill-current"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
