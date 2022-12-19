import classNames from "classnames";
import React, { useEffect, useState } from "react";
import JupButton from "src/components/JupButton";
import LeftArrowIcon from "src/icons/LeftArrowIcon";
import { WidgetPosition, WidgetSize } from "src/types";

const WidgetTerminal = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState<WidgetPosition>("bottom-right");
  const [size, setSize] = useState<WidgetSize>("default");

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (!isLoaded) {
      intervalId = setInterval(() => {
        setIsLoaded(Boolean(window.Jupiter));
      }, 500);

      window.Jupiter.init({
        mode: "default",
        displayMode: "widget",
        widgetStyle: {
          position: "bottom-right",
          size: "default",
        },
        endpoint:
          "https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci",
      });
    }

    if (intervalId) {
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.Jupiter.init({
        mode: "default",
        displayMode: "widget",
        widgetStyle: {
          position,
          size,
        },
        endpoint:
          "https://solana-mainnet.g.alchemy.com/v2/ZT3c4pYf1inIrB0GVDNR7nx4LwyED5Ci",
      });
    }
  }, [position, size]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-9 px-2 md:px-0">
        <div>
          <h2 className="font-semibold text-lg">Position & Size</h2>
          <p className="text-white/30 text-xs">
            Click the screen edge position to see how
            <br />
            it appear on your browser
          </p>
        </div>

        <div>
          <div className="relative mt-9 md:mt-0">
            <div className="bg-white/10 rounded-xl flex items-center justify-center w-full md:w-[384px] h-[216px]">
              <span className="text-xs text-white/50">
                Click edge to see position
              </span>

              {/* Top left  */}
              <div
                className={classNames(
                  "absolute left-1 top-1 cursor-pointer hover:bg-black/20 rounded-full p-1",
                  {
                    "jup-gradient": position === "top-left",
                  }
                )}
                onClick={() => setPosition("top-left")}
              >
                <div className="rotate-45">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Top right  */}
              <div
                className={classNames(
                  "absolute right-1 top-1 cursor-pointer hover:bg-black/20 rounded-full p-1",
                  {
                    "jup-gradient": position === "top-right",
                  }
                )}
                onClick={() => setPosition("top-right")}
              >
                <div className="rotate-[135deg]">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Bottom left  */}
              <div
                className={classNames(
                  "absolute left-1 bottom-1 cursor-pointer hover:bg-black/20 rounded-full p-1",
                  {
                    "jup-gradient": position === "bottom-left",
                  }
                )}
                onClick={() => setPosition("bottom-left")}
              >
                <div className="-rotate-45">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>

              {/* Bottom right  */}
              <div
                className={classNames(
                  "absolute right-1 bottom-1 cursor-pointer hover:bg-black/20 rounded-full p-1",
                  {
                    "jup-gradient": position === "bottom-right",
                  }
                )}
                onClick={() => setPosition("bottom-right")}
              >
                <div className="rotate-[225deg]">
                  <LeftArrowIcon width={24} height={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Set Size</span>

            <div className="space-x-2 p-1.5 mt-2 bg-black/30 rounded-xl">
              <JupButton
                size="sm"
                onClick={() => {
                  setSize("sm");
                }}
                type="button"
                className={
                  size === "sm" ? "bg-white/10" : "opacity-20 hover:opacity-70"
                }
              >
                <div className="flex items-center space-x-2 text-xs">
                  <div>Small</div>
                </div>
              </JupButton>
              <JupButton
                size="sm"
                onClick={() => {
                  setSize("default");
                }}
                type="button"
                className={
                  size === "default"
                    ? "bg-white/10"
                    : "opacity-20 hover:opacity-70"
                }
              >
                <div className="flex items-center space-x-2 text-xs">
                  <div>Default</div>
                </div>
              </JupButton>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 py-4">
        <div className="border-b border-white/10" />
      </div>
    </div>
  );
};

export default WidgetTerminal;
