import React, { useEffect, useState } from 'react';
import JupiterLogo from 'src/icons/JupiterLogo';

interface AppHeaderProps {
  isSideDrawerOpen?: boolean;
  setIsSideDrawerOpen?: (isOpen: boolean) => void;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const handleToggleMenu = () => setOpenMobileMenu(!openMobileMenu);

  useEffect(() => {
    const body = document.querySelector('body');
    if (openMobileMenu) {
      body!.style.overflow = 'hidden';
    } else {
      body!.style.overflow = '';
    }
  }, [openMobileMenu]);


  return (
    <>
      <div className="flex items-center justify-between w-full bg-landing-bg">
        <div className="flex items-center p-4">
          <h1 className="flex items-center text-lg font-semibold text-white">
              <JupiterLogo/>
              <span className="ml-3">Jupiter Plugin</span>
            </h1>
        </div>
      </div>

   
    </>
  );
};

export default AppHeader;
