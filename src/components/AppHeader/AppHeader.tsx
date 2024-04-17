import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CloseIcon from 'src/icons/CloseIcon';
import JupiterLogo from 'src/icons/JupiterLogo';
import MenuIcon from 'src/icons/MenuIcon';
import HeaderLinks from './HeaderLinks';
import HeaderLinksMobile from './HeaderLinksMobile';
import TopBanner from './TopBanner';

const AppHeader: React.FC<{}> = () => {
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
      <TopBanner />
      
      <div className="flex items-center justify-between w-full bg-black/[.35]">
        <div className="flex items-center flex-1 p-4">
          <button onClick={handleToggleMenu} type="button" className="w-6 mr-3 text-white md:hidden">
            {openMobileMenu ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link href="https://jup.ag" shallow className="flex-1">
            <h1 className="flex items-center text-lg font-semibold text-white">
              <JupiterLogo />
              <span className="ml-3">Jupiter</span>
            </h1>
          </Link>
        </div>

        <HeaderLinks />

        <div className="flex-1" />
      </div>

      {openMobileMenu && (
        <div
          style={{
            height: 'calc(100vh - 70px)',
          }}
          className="z-[60] md:hidden fixed top-[60px] left-0 w-full bg-[rgba(62,62,69,0.85)] backdrop-blur-[20px]"
          onClick={handleToggleMenu}
        >
          <HeaderLinksMobile />
        </div>
      )}
    </>
  );
};

export default AppHeader;
