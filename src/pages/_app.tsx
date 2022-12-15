import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";

import "tailwindcss/tailwind.css";
import "../styles/app.css";
import "../styles/globals.css";

import JupButton from "src/components/JupButton";
import ModalTerminal from "src/content/ModalTerminal";
import { Jupiter } from "../index";
import IntegratedTerminal from "src/content/IntegratedTerminal";
import { IInit } from "src/types";
import WidgetTerminal from "src/content/WidgetTerminal";
import AppHeader from "src/components/AppHeader/AppHeader";
import SexyChameleonText from "src/components/SexyChameleonText/SexyChameleonText";
import TerminalModalIcon from "src/icons/TerminalModalIcon";
import TerminalIntegratedIcon from "src/icons/TerminalIntegratedIcon";
import TerminalWidgetIcon from "src/icons/TerminalWidgetIcon";
import Footer from "src/components/Footer/Footer";

if (typeof window !== "undefined") {
  window.Jupiter = Jupiter;
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
              <p className="text-[#9D9DA6]">Visual demo for integrating</p>
              <SexyChameleonText className="text-[52px] font-semibold px-4 md:px-0">
                Jupiter Terminal
              </SexyChameleonText>
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
