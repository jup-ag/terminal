import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app'

import 'tailwindcss/tailwind.css';
import '../styles/app.css';
import '../styles/globals.css';

import JupButton from 'src/components/JupButton';
import ModalTerminal from 'src/content/ModalTerminal';
import { Jupiter } from '../index';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import { IInit } from 'src/types';
import WidgetTerminal from 'src/content/WidgetTerminal';


if (typeof window !== 'undefined') {
  window.Jupiter = Jupiter
}

export default function App({ Component, pageProps }: AppProps) {
  const [tab, setTab] = useState<IInit['displayMode']>('modal')

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }
  }, [tab])

  return (
    <div className='flex items-center justify-center h-screen w-screen overflow-auto'>
      <div className='flex flex-col h-full w-full px-4 mt-8'>
        <div>
          <h1 className='text-2xl font-bold'>Jupiter Terminal Example</h1>

          <div className='space-x-4 mt-4'>
            <JupButton onClick={() => { setTab('modal') }} type='button' className={tab === 'modal' ? '' : 'opacity-20 hover:opacity-70'}>Modal</JupButton>
            <JupButton onClick={() => { setTab('integrated') }} type='button' className={tab === 'integrated' ? '' : 'opacity-20 hover:opacity-70'}>Integrated</JupButton>
            <JupButton onClick={() => { setTab('widget') }} type='button' className={tab === 'widget' ? '' : 'opacity-20 hover:opacity-70'}>Widget</JupButton>
          </div>
        </div>

        <hr className='my-4' />

        {tab === 'modal' ? (
          <>
            <h2 className='font-bold text-2xl mb-4'>Modal Terminal</h2>
            <ModalTerminal />
          </>
        ) : null}

        {tab === 'integrated' ? (
          <>
            <h2 className='font-bold text-2xl mb-4'>Integrated Terminal</h2>
            <IntegratedTerminal />
          </>
        ) : null}
        
        {tab === 'widget' ? (
          <>
            <h2 className='font-bold text-2xl mb-4'>Widget Terminal</h2>
            <WidgetTerminal />
          </>
        ) : null}
      </div>
    </div>
  );
}
