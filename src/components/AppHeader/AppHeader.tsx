import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import CloseIcon from 'src/icons/CloseIcon';
import JupiterLogo from 'src/icons/JupiterLogo';
import MenuIcon from 'src/icons/MenuIcon';
import HeaderLinks from './HeaderLinks';

const AppHeader: React.FC<{}> = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const handleToggleMenu = () => setOpenMobileMenu(!openMobileMenu);

  return (
    <div className="flex items-center justify-between w-full px-4 py-4 md:px-8">
      <div className="flex items-center flex-1">
        <button
          onClick={handleToggleMenu}
          type="button"
          className="w-6 mr-3 md:hidden text-white"
        >
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

      <div className='flex-1' />
    </div>
  )
}

export default AppHeader