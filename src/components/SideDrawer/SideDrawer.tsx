import React, { useState } from 'react';
import { cn } from 'src/misc/cn';

interface SideDrawerProps {
  children?: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
  width?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  children,
  className,
  position = 'left',
  isOpen,
  setIsOpen,
}) => {

  return (
    <div
    className={cn(
      'fixed top-0 h-full bg-[#151E31] border-r border-interactive z-[60] transition-transform duration-300 ease-in-out',
      'w-full md:w-[600px]', // Responsive width: full on mobile, w-100 on desktop
      position === 'left' ? 'left-0' : 'right-0',
      isOpen ? 'transform translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full',
      className,
    )}
  >
    {children}
  </div>
  );
};

export default SideDrawer;
