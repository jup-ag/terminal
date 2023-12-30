import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import CloseIcon from 'src/icons/CloseIcon';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import V2SexyChameleonText from '../SexyChameleonText/V2SexyChameleonText';
import SnippetSyncProps from './snippet/SnippetSyncProps';
import JupButton from '../JupButton';
import { useOutsideClick } from 'src/misc/utils';
import Link from 'next/link';
import ExternalIcon from 'src/icons/ExternalIcon';
import JupiterLogo from 'src/icons/JupiterLogo';
import MeteoraLogo from 'src/icons/MeteoraLogo';
import SnippetReferralAccount from './snippet/SnippetReferralAccount';
import SnippetNewCallbacks from './snippet/SnippetNewCallbacks';

const Title: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="mt-6 text-white text-md text-center font-semibold">{children}</div>
);

const Desc: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="text-white/70 text-sm text-center">{children}</div>
);

export const V2_FEATURE_BUTTON_ID = 'v2-feature-button';
const V2FeatureButton = () => {
  const [open, setOpen] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  const onEnter = () => {
    setOpen(true);
    setTimeout(() => {
      setSlideIn(true);
    }, 100);
  };

  const onExit = () => {
    setSlideIn(false);
    setTimeout(() => {
      setOpen(false);
    }, 500);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (open && containerRef.current) {
      setContainerDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, [open]);

  const tweetContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;

    const container = tweetContainerRef.current?.childNodes[0];

    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!intervalId) {
      intervalId = setInterval(() => {
        if (!container) return;

        if (containerDimensions.width > 0) {
          (container as HTMLDivElement).style.width = Math.min(550, containerDimensions.width) + 'px';
        }

        if (Number((container as HTMLDivElement).style?.width) !== 0) {
          clearInterval(intervalId);
        }
      }, 500);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [open, tweetContainerRef, containerDimensions.width]);

  useOutsideClick(containerRef, onExit);

  return (
    <div className="">
      <p
        id={V2_FEATURE_BUTTON_ID}
        onClick={onEnter}
        className="mt-2 text-white text-sm font-semibold cursor-pointer border border-white/50 hover:bg-white/10 px-2 py-1 rounded-xl"
      >{`What's new in V2 ✨`}</p>

      {open && (
        <div className="fixed w-screen min-h-screen left-0 top-0 z-[60] flex justify-center bg-black/50 text-white overflow-y-scroll">
          <div
            ref={containerRef}
            className={classNames(
              'bg-v3-bg absolute w-full lg:w-[75%] rounded-xl flex shadow-lg max-w-[800px] hideScrollbar',
              'transform duration-500',
              slideIn ? '!top-[40px] lg:!top-[12.5%]' : '!top-[300%] !lg:top-[200%]',
            )}
          >
            <div className="fixed top-4 right-4 text-white fill-current cursor-pointer" onClick={onExit}>
              <CloseIcon />
            </div>

            <div className="w-full flex flex-col items-center py-4 px-4 lg:py-8 lg:px-16">
              <div className="flex space-x-2">
                <V2SexyChameleonText className="text-3xl lg:text-4xl md:text-[52px] font-semibold">
                  Jupiter Terminal
                </V2SexyChameleonText>

                <div className="px-1 py-0.5 bg-v3-primary rounded-md ml-2.5 font-semibold flex text-xs self-start text-black">
                  v2
                </div>
              </div>

              <Title>Now with Jupiter V6 API, powered by The Metis Routing Algo</Title>

              {open && containerDimensions.width > 0 ? (
                <div ref={tweetContainerRef} className="flex justify-center w-full min-h-[500px] lg:min-h-[600px]">
                  <TwitterTweetEmbed
                    tweetId={'1684583550174244864'}
                    options={{
                      // the max embedded tweet can go is 550px
                      width: Math.min(550, containerDimensions.width),
                      height: 400,
                      minWidth: containerDimensions.width,
                      minHeight: 400,
                    }}
                  />
                </div>
              ) : null}

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>Easier Referral Support</Title>
              <Desc>
                With the new
                <span className="mx-1 text-v3-primary">referralAccount</span>
                support, integrating fees support is now easier than ever.
              </Desc>

              <div className="mt-2 w-full">
                <SnippetReferralAccount />
              </div>

              <Link
                className="mt-4 px-4 py-2 bg-black rounded-xl flex space-x-2 items-center"
                href={'https://docs.jup.ag/docs/apis/adding-fees'}
                rel="noreferrer noopener"
                target="_blank"
              >
                <span>Learn more</span>
                <ExternalIcon />
              </Link>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>Cross app state sharing with Jupiter Terminal</Title>
              <Desc>
                With the new
                <span className="mx-1 text-v3-primary">syncProps()</span>
                API, bringing even closer integration with Terminal.
              </Desc>

              <div className="mt-4 flex flex-col items-center w-full">
                <Desc>
                  {`Starting with Wallet Passthrough, `}
                  <span className="mx-1 text-v3-primary">syncProps()</span>
                  {`API will make sure your wallet state are
                always in sync, and Terminal can also callback to your dApp to request for wallet connection.`}
                </Desc>

                <div className="mt-2 w-full">
                  <SnippetSyncProps />
                </div>
              </div>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>Unified, with Unified Wallet Kit</Title>
              <Desc>
                Unified Wallet Kit is an open-sourced, Swiss Army Knife wallet adapter, striving for the best wallet
                integration experience for developers, and best wallet experience for your users.
                <br />
                <br />
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <span>Used by</span>
                    <Link href="https://jup.ag" target="_blank">
                      <JupiterLogo />
                    </Link>
                    <Link href="https://app.meteora.ag" target="_blank">
                      <MeteoraLogo />
                    </Link>
                  </div>

                  <Link
                    className="mt-4 px-4 py-2 bg-black rounded-xl flex space-x-2 items-center"
                    href={'https://github.com/TeamRaccoons/wallet-kit'}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    <span>Open on Github</span>
                    <ExternalIcon />
                  </Link>
                </div>
              </Desc>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>RPC Monitor</Title>
              <Desc>
                Built in RPC Monitor allows your user to know if their RPC is not responding or the Solana network is
                degraded.
              </Desc>

              <div className="mt-2 border p-2 border-white/10 rounded-xl">
                <div className="mt-2 mb-3 max-w-[384px] bg-[#FBA43A] rounded-xl flex items-center justify-between px-3 py-2">
                  <span className="flex text-xs justify-center items-center text-left">
                    <div className="ml-1 text-rock">
                      <span>
                        <span>Your RPC is not responding to any requests.</span>
                      </span>
                    </div>
                  </span>
                </div>

                <div className="mt-2 mb-3 max-w-[384px] bg-[#FBA43A] rounded-xl flex items-center justify-between px-3 py-2">
                  <span className="flex text-xs justify-center items-center text-left">
                    <div className="ml-1 text-rock">
                      <span>
                        <span>
                          Solana network is experiencing degraded performance. Transactions may fail to send or confirm.
                        </span>
                      </span>
                    </div>
                  </span>
                </div>
              </div>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>More callbacks</Title>
              <Desc>With new callbacks that should make state sharing, notifications, and more, between your dApp and Terminal even easier.</Desc>
              <div className="mt-2 w-full">
                <SnippetNewCallbacks />
              </div>

              <JupButton className="my-20 w-[200px]" size="lg" onClick={onExit}>
                <V2SexyChameleonText>Close</V2SexyChameleonText>
              </JupButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default V2FeatureButton;
