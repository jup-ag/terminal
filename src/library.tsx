import { createRoot } from "react-dom/client";
import { IInit } from "./types";

import "tailwindcss/tailwind.css";
import "src/styles/globals.css";

const containerId = "jupiter-terminal";

const resume = () => {
  const instanceExist = document.getElementById(containerId);
  if (instanceExist) {
    instanceExist.classList.remove("hidden");
    instanceExist.classList.add("block");
    return;
  }
};

const close = () => {
  const targetDiv = document.getElementById(containerId);
  if (targetDiv) {
    targetDiv.classList.add("hidden");
  }
};

async function loadJupiter() {
  const script = new Promise<any>((res, rej) => {
    const existing = document.getElementById(
      'jupiter-load-script-app',
    ) as HTMLScriptElement | null;

    if (existing) {
      res({});
    } else {
      const el = document.createElement('script');
      el.onload = res;
      el.onerror = rej;
      el.id = 'jupiter-load-script';
      el.type = 'text/javascript';
      el.src = 'http://localhost:63733/main-0.1.6-app.js';
      document.head.append(el);
    }
  });

  const css = new Promise((res, rej) => {
    const existing = document.getElementById(
      'jupiter-load-styles',
    ) as HTMLLinkElement | null;

    if (existing) {
      res({});
    } else {
      const el = document.createElement('link');
      el.onload = res;
      el.onerror = rej;
      el.id = 'jupiter-load-styles';
      el.rel = 'stylesheet';
      el.href = 'http://localhost:63733/main-0.1.6.css';
      document.head.append(el);
    }
  });

  try {
    const [loadedScript, loadedCss] = await Promise.all([script, css]);
    return [loadedScript, loadedCss];
  } catch (error) {
    console.error(`Error loading Jupiter Terminal: ${error}`)
    throw new Error(`Error loading Jupiter Terminal: ${error}`);
  }
}

const init = async (props: IInit) => {
  await loadJupiter();

  const { RenderWidget, RenderJupiter } = (window as any).Jupiter
  console.log(RenderWidget, RenderJupiter)

  const { passThroughWallet, onSwapError, onSuccess, integratedTargetId, ...restProps } = props;

  if (props.mode === "outputOnly" && !props.mint) {
    throw new Error("outputOnly mode requires a mint!");
  }

  const targetDiv = document.createElement("div");
  const instanceExist = document.getElementById(containerId);

  // If there's existing instance, just show it
  if (instanceExist) {
    window.Jupiter.root?.unmount();
    window.Jupiter._instance = null;
    instanceExist?.remove();
  }

  targetDiv.id = containerId;
  targetDiv.classList.add('w-full')
  targetDiv.classList.add('h-full')

  if (restProps.displayMode === 'integrated') {
    const target = document.getElementById(integratedTargetId!);
    if (!target) {
      throw new Error(`Jupiter Terminal: document.getElementById cannot find ${integratedTargetId}`);
    }

    target?.appendChild(targetDiv);
  } else {
    document.body.appendChild(targetDiv);
  }

  let element;
  if (restProps.displayMode === 'widget') {
    element = (
      <RenderWidget {...restProps} />
    );
  } else {
    element = (
      <RenderJupiter {...props} />
    );
  }
  const root = createRoot(targetDiv);
  root.render(element);
  window.Jupiter.root = root;
  window.Jupiter._instance = element;

  // Passthrough & Callbacks
  window.Jupiter.passThroughWallet = passThroughWallet;
  window.Jupiter.onSwapError = onSwapError;
  window.Jupiter.onSuccess = onSuccess;
};

const Jupiter = {
  _instance: null,
  passThroughWallet: null,
  root: null,
  init,
  resume,
  close,
};

export { Jupiter, init };
