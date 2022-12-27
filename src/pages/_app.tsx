import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";

import "tailwindcss/tailwind.css";
import "../styles/globals.css";

import AppHeader from "src/components/AppHeader/AppHeader";
import SexyChameleonText from "src/components/SexyChameleonText/SexyChameleonText";
import TerminalModalIcon from "src/icons/TerminalModalIcon";
import TerminalIntegratedIcon from "src/icons/TerminalIntegratedIcon";
import TerminalWidgetIcon from "src/icons/TerminalWidgetIcon";
import Footer from "src/components/Footer/Footer";

import JupButton from 'src/components/JupButton';
import ModalTerminal from 'src/content/ModalTerminal';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import { IInit } from 'src/types';
import WidgetTerminal from 'src/content/WidgetTerminal';

const isDeveloping = process.env.NODE_ENV === 'development' && typeof window !== "undefined";
// In NextJS preview env settings
const isPreview = Boolean(process.env.NEXT_PUBLIC_IS_NEXT_PREVIEW);
if ((isDeveloping || isPreview) && typeof window !== "undefined") {
  // Initialize an empty value, simulate webpack IIFE when imported
  (window as any).Jupiter = {};
  
  // Perform local fetch on development, and next preview
  Promise.all([
    import('../library'),
    import('../index'),
  ]).then((res) => {
    const [libraryProps, rendererProps] = res;

    (window as any).Jupiter = libraryProps;
    (window as any).JupiterRenderer = rendererProps;
  })
}

export default function App({ Component, pageProps }: AppProps) {
  const [tab, setTab] = useState<IInit["displayMode"]>("modal");

  // Cleanup on tab change
  useEffect(() => {
    if (window.Jupiter._instance) {
      window.Jupiter._instance = null;
    }
  }, [tab]);

  return (
    <div className="bg-jupiter-dark-bg h-screen w-screen overflow-auto flex flex-col justify-between">
      <div>
        <AppHeader />

        <div className="flex">
          <div className="flex flex-col items-center h-full w-full mt-4 md:mt-14">
            <div className="flex flex-col justify-center items-center text-center">
              <SexyChameleonText className="text-4xl md:text-[52px] font-semibold px-4 md:px-0">
                Jupiter Terminal
              </SexyChameleonText>
              <p className="text-[#9D9DA6] w-[80%] md:max-w-[60%] text-md mt-4 heading-[24px]">
                An open-sourced, lite version of Jupiter that provides end-to-end swap flow by linking it in your HTML.
                Check out the visual demo for the various integration modes below.
              </p>
            </div>

            <div className="space-x-2 p-1.5 mt-12 bg-black/30 rounded-xl">
              <JupButton
                size="sm"
                onClick={() => {
                  setTab("modal");
                }}
                type="button"
                className={
                  tab === "modal"
                    ? "bg-white/10"
                    : "opacity-20 hover:opacity-70"
                }
              >
                <div className="flex items-center space-x-2 text-xs">
                  <TerminalModalIcon />
                  <div>Modal</div>
                </div>
              </JupButton>
              <JupButton
                size="sm"
                onClick={() => {
                  setTab("integrated");
                }}
                type="button"
                className={
                  tab === "integrated"
                    ? "bg-white/10"
                    : "opacity-20 hover:opacity-70"
                }
              >
                <div className="flex items-center space-x-2 text-xs">
                  <TerminalIntegratedIcon />
                  <div>Integrated</div>
                </div>
              </JupButton>
              <JupButton
                size="sm"
                onClick={() => {
                  setTab("widget");
                }}
                type="button"
                className={
                  tab === "widget"
                    ? "bg-white/10"
                    : "opacity-20 hover:opacity-70"
                }
              >
                <div className="flex items-center space-x-2 text-xs">
                  <TerminalWidgetIcon />
                  <div>Widget</div>
                </div>
              </JupButton>
            </div>


            <span className="flex justify-center text-center text-xs max-w-[90%] md:max-w-[50%] text-[#9D9DA6] mt-4">
              {tab === "modal" ? 'Jupiter renders as a modal and takes up the whole screen.' : null}
              {tab === "integrated" ? 'Jupiter renders as a part of your dApp.' : null}
              {tab === "widget" ? 'Jupiter renders as part of a widget that can be placed at different positions on your dApp.' : null}
            </span>

            <div className="w-full max-w-3xl px-4 md:px-0 text-white/75 mt-9 mb-16">
              {tab === "modal" ? <ModalTerminal /> : null}
              {tab === "integrated" ? <IntegratedTerminal /> : null}
              {tab === "widget" ? <WidgetTerminal /> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-jupiter-bg">
        <Footer />
      </div>
    </div>
  );
}
