import type { AppProps } from 'next/app'
import ReactDOM from "react-dom/client";

import { TokenContextProvider } from '../contexts/TokenContextProvider';
import { ContextProvider } from '../contexts/ContextProvider';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';
import JupiterApp from 'src/components/Jupiter';
import JupButton from 'src/components/JupButton';
import { ScreenProvider } from 'src/contexts/ScreenProvider';

interface IInit {
  containerId: string;
}

interface JupiterEmbed {
  containerId: string;
  _instance: React.ReactNode;
  init: ({ containerId }: IInit) => void;
  close: () => void;
}

declare global {
  interface Window {
    Jupiter: JupiterEmbed;
  }
}

const renderJupiterApp = () => {
  return (
    <div className='absolute top-0 w-screen h-screen flex items-center justify-center bg-black/25'>
      <ContextProvider customEndpoint={'https://mango.rpcpool.com'}>
        <TokenContextProvider>
          <ScreenProvider>
            <JupiterApp />
          </ScreenProvider>
        </TokenContextProvider>
      </ContextProvider>
    </div>
  )
}

(() => {
  if (typeof window !== 'undefined') {
    window.Jupiter = {
      containerId: '',
      _instance: null,
      init: ({ containerId }) => {
        const targetDiv = document.getElementById(containerId) ?? document.createElement('div');

        if (window.Jupiter._instance) {
          targetDiv.classList.remove('hidden')
          targetDiv.classList.add('block')
          return;
        }

        targetDiv.id = containerId
        document.body.appendChild(targetDiv);

        const root = ReactDOM.createRoot(
          targetDiv
        );

        const element = window.Jupiter._instance || renderJupiterApp();
        root.render(element);
        window.Jupiter.containerId = containerId;
        window.Jupiter._instance = element;
      },
      close: () => {
        if (window.Jupiter._instance) {
          const targetDiv = document.getElementById(window.Jupiter.containerId);
          if (targetDiv) {
            targetDiv.classList.add('hidden')
          }
        }
      }
    }
  }
})();

export default function App({ Component, pageProps }: AppProps) {
  // TODO: Init configurable endpoints

  const initWithoutWallet = () => {
    window.Jupiter.init({
      containerId: 'jupiter-instance'
    });
  }

  return (
    <div className='flex flex-col h-screen w-screen items-center justify-center'>
      <h1 className='text-2xl'>Jupiter Embed App</h1>

      <div className='mt-10'>
        <JupButton onClick={initWithoutWallet}>
          Init Jupiter
        </JupButton>
      </div>
    </div>
  );
}
