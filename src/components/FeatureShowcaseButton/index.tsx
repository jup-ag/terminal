import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import CloseIcon from 'src/icons/CloseIcon';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import V2SexyChameleonText from '../SexyChameleonText/V2SexyChameleonText';
import JupButton from '../JupButton';
import { useOutsideClick } from 'src/misc/utils';
import Image from 'next/image';
import TokenIcon from '../TokenIcon';
import { SOL_TOKEN_INFO } from 'src/misc/constants';

const Title: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="mt-6 text-white text-md text-center font-semibold">{children}</div>
);

const Desc: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="text-white/70 text-sm text-center">{children}</div>
);

export const FEATURE_SHOWCASE_BUTTON_ID = 'features-showcase-button';
const FeatureShowcaseButton = () => {
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
        id={FEATURE_SHOWCASE_BUTTON_ID}
        onClick={onEnter}
        className="mt-2 text-white text-sm font-semibold cursor-pointer border border-white/50 hover:bg-white/10 px-2 py-1 rounded-xl"
      >{`What's new✨`}</p>

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
                  v3
                </div>
              </div>

              <Title>
                Introducing Jupiter Swap V3
                <p>Leveraging our new Metropolis liquidity backend to enable:</p>
                <V2SexyChameleonText className="flex flex-col gap-y-1">
                  Instant Routing, Smart Token Filtering, Ecosystem Token List, Dynamic Slippage, more!
                </V2SexyChameleonText>
              </Title>

              {open && containerDimensions.width > 0 ? (
                <div ref={tweetContainerRef} className="flex justify-center w-full min-h-[500px] lg:min-h-[600px]">
                  <TwitterTweetEmbed
                    tweetId={'1805278727032774761'}
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

              <Title>Dynamic slippage</Title>
              <Desc>
                <span className="mx-1 text-v3-primary">Dynamic slippage</span> optimizes your slippage to safeguard
                against front-running while maximizing transaction success rate.
                <div className="flex w-full justify-center mt-5">
                  <Image
                    alt="ExactInOrOut demo"
                    src={'/demo/dynamic-slippage-demo.gif'}
                    width={Math.min(550, containerDimensions.width)}
                    height={400}
                  />
                </div>
              </Desc>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>ExactIn or ExactOut</Title>
              <Desc>
                <span className="mx-1 text-v3-primary">ExactInOrOut</span> are now the default behaviour, enabling
                seamless switching between ExactIn or ExactOut mode.
                <div className="flex w-full justify-center mt-5">
                  <Image
                    alt="ExactInOrOut demo"
                    src={'/demo/exactinorout-demo.gif'}
                    width={Math.min(550, containerDimensions.width)}
                    height={400}
                  />
                </div>
              </Desc>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>New MTS tagging system</Title>
              <Desc>
                <span className="mx-1 text-v3-primary">MTS tagging system</span> are now integrated.
                <div className="flex w-full justify-center mt-5">
                  <Image
                    alt="New MTS community tags"
                    src={'/demo/community-tags-demo.png'}
                    width={Math.min(550, containerDimensions.width)}
                    height={400}
                  />
                </div>
              </Desc>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>Image Optim</Title>
              <Desc>
                <span className="mx-1 text-v3-primary">Image optim via CDN</span> are now supported for all token
                images, lower dimensions, and faster loading.
                <div className="flex w-full justify-center mt-5">
                  <TokenIcon info={SOL_TOKEN_INFO} />
                </div>
              </Desc>

              <div className="border-b border-white/10 w-full mt-4" />

              <Title>General improvements</Title>
              <Desc>
                <ul className="list-disc list-outside text-left space-y-2 p-4">
                  <li>
                    <span className="mx-1 text-v3-primary">Local cache improvements</span>
                    Initial tokens info, and reference fees are now cached, and persisted for several minutes.
                  </li>

                  <li>
                    <span className="mx-1 text-v3-primary">RPC via Connection object</span>
                    RPC connection is now available via Connection object, allowing for more flexible RPC connection,
                    including websocket customisation, authorization
                  </li>

                  <li>
                    <span className="mx-1 text-v3-primary">Bug fixes</span>
                    Exponentially small numbers failing to parse, and many more.
                  </li>
                </ul>
              </Desc>

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

export default FeatureShowcaseButton;
