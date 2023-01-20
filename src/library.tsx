import { createRoot } from 'react-dom/client';
import { IInit } from './types';

import 'tailwindcss/tailwind.css';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import JupiterLogo from './icons/JupiterLogo';

const containerId = 'jupiter-terminal';
const packageJson = require('../package.json');
const bundleName = `main-${packageJson.version}`;

const scriptDomain =
  (() => {
    if (typeof window === 'undefined') return '';

    const url = (document.currentScript as HTMLScriptElement)?.src;
    if (url) {
      return new URL(url).origin;
    }
    return '';
  })() || 'https://terminal.jup.ag';

async function preloadJupiter() {
  const script = new Promise<any>((res, rej) => {
    const el = document.createElement('link');
    el.rel = 'preload';
    el.as = 'script';
    el.onload = res;
    el.onerror = rej;
    el.id = 'jupiter-load-script';
    el.type = 'text/javascript';
    el.href = `${scriptDomain}/${bundleName}-app.js`;
    document.head.append(el);
  });

  const cssApp = new Promise((res, rej) => {
    const existing = document.getElementById('jupiter-load-styles-jupiter') as HTMLLinkElement | null;

    if (existing) {
      res({});
    } else {
      const el = document.createElement('link');
      el.onload = res;
      el.onerror = rej;
      el.id = 'jupiter-load-styles-jupiter';
      el.rel = 'stylesheet';
      el.href = `${scriptDomain}/${bundleName}-Jupiter.css`;
      document.head.append(el);
    }
  });

  const cssTailwind = new Promise((res, rej) => {
    const existing = document.getElementById('jupiter-load-styles-tailwind') as HTMLLinkElement | null;

    if (existing) {
      res({});
    } else {
      const el = document.createElement('link');
      el.onload = res;
      el.onerror = rej;
      el.id = 'jupiter-load-styles-tailwind';
      el.rel = 'stylesheet';
      el.href = `${scriptDomain}/${bundleName}-Tailwind.css`;
      document.head.append(el);
    }
  });

  try {
    await Promise.all([script, cssApp, cssTailwind]);
  } catch (error) {
    console.error(`Error pre-loading Jupiter Terminal: ${error}`);
    throw new Error(`Error pre-loading Jupiter Terminal: ${error}`);
  }
}

async function loadJupiter() {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const script = new Promise<any>((res, rej) => {
    const existing = document.getElementById('jupiter-load-script-app') as HTMLScriptElement | null;

    if (existing) {
      res({});
    } else {
      const el = document.createElement('script');
      el.onload = res;
      el.onerror = rej;
      el.id = 'jupiter-load-script';
      el.type = 'text/javascript';
      el.src = `${scriptDomain}/${bundleName}-app.js`;
      document.head.append(el);
    }
  });

  const cssApp = new Promise((res, rej) => {
    const existing = document.getElementById('jupiter-load-styles-jupiter') as HTMLLinkElement | null;

    if (existing) {
      res({});
    } else {
      const el = document.createElement('link');
      el.onload = res;
      el.onerror = rej;
      el.id = 'jupiter-load-styles-jupiter';
      el.rel = 'stylesheet';
      el.href = `${scriptDomain}/${bundleName}-Jupiter.css`;
      document.head.append(el);
    }
  });

  const cssTailwind = new Promise((res, rej) => {
    const existing = document.getElementById('jupiter-load-styles-tailwind') as HTMLLinkElement | null;

    if (existing) {
      res({});
    } else {
      const el = document.createElement('link');
      el.onload = res;
      el.onerror = rej;
      el.id = 'jupiter-load-styles-tailwind';
      el.rel = 'stylesheet';
      el.href = `${scriptDomain}/${bundleName}-Tailwind.css`;
      document.head.append(el);
    }
  });

  try {
    await Promise.all([script, cssApp, cssTailwind]);
  } catch (error) {
    console.error(`Error loading Jupiter Terminal: ${error}`);
    throw new Error(`Error loading Jupiter Terminal: ${error}`);
  }
}

const defaultStyles: CSSProperties = {
  zIndex: 50,
};

const RenderLoadableJupiter = (props: IInit) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    loadJupiter();

    let intervalId: NodeJS.Timer;
    if (!loaded) {
      intervalId = setInterval(() => {
        const instance = (window as any).JupiterRenderer?.RenderJupiter;
        if (instance) {
          setLoaded(true);
        }
      }, 50);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [loaded]);

  const RenderJupiter: (props: any) => JSX.Element = useMemo(() => {
    if (loaded) {
      return (window as any).JupiterRenderer.RenderJupiter;
    }

    return EmptyJSX;
  }, [loaded]);

  return <RenderJupiter {...props} scriptDomain={scriptDomain} />;
};

const EmptyJSX = () => <></>;
const RenderShell = (props: IInit) => {
  const displayMode = props.displayMode;
  const containerStyles = props.containerStyles;
  const containerClassName = props.containerClassName;

  const displayClassName = useMemo(() => {
    // Default Modal
    if (!displayMode || displayMode === 'modal') {
      return 'fixed top-0 w-screen h-screen flex items-center justify-center bg-black/50';
    } else if (displayMode === 'integrated' || displayMode === 'widget') {
      return 'flex items-center justify-center w-full h-full';
    }
  }, [displayMode]);

  const contentClassName = useMemo(() => {
    // Default Modal
    if (!displayMode || displayMode === 'modal') {
      return `flex flex-col h-screen w-screen max-h-[90vh] md:max-h-[600px] max-w-[360px] overflow-auto text-black relative bg-jupiter-bg rounded-lg webkit-scrollbar ${
        containerClassName || ''
      }`;
    } else if (displayMode === 'integrated' || displayMode === 'widget') {
      return 'flex flex-col h-full w-full overflow-auto text-black relative webkit-scrollbar';
    }
  }, [displayMode]);

  const onClose = () => {
    if (window.Jupiter) {
      window.Jupiter.close();
    }
  };

  return (
    <div className={displayClassName}>
      {/* eslint-disable @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Poppins&display=swap"
        rel="stylesheet"
      ></link>

      <div style={{ ...defaultStyles, ...containerStyles }} className={contentClassName}>
        <RenderLoadableJupiter {...props} />
      </div>

      {!displayMode || displayMode === 'modal' ? (
        <div onClick={onClose} className="absolute w-screen h-screen top-0 left-0" />
      ) : null}
    </div>
  );
};

const RenderWidgetShell = (props: IInit) => {
  const [isOpen, setIsOpen] = useState(false);

  const classes = useMemo(() => {
    const size = props.widgetStyle?.size || 'default';

    let result: { containerClassName: string; contentClassName: string } | undefined = undefined;
    if (!props.widgetStyle?.position || props.widgetStyle?.position === 'bottom-right') {
      result = {
        containerClassName: 'bottom-6 right-6',
        contentClassName: size === 'default' ? 'bottom-[60px] -right-3' : 'bottom-[44px] -right-4',
      };
    }
    if (props.widgetStyle?.position === 'bottom-left') {
      result = {
        containerClassName: 'bottom-6 left-6',
        contentClassName: size === 'default' ? 'bottom-[60px] -left-3' : 'bottom-[44px] -left-4',
      };
    }
    if (props.widgetStyle?.position === 'top-left') {
      result = {
        containerClassName: 'top-6 left-6',
        contentClassName: size === 'default' ? 'top-[60px] -left-3' : 'top-[44px] -left-4',
      };
    }
    if (props.widgetStyle?.position === 'top-right') {
      result = {
        containerClassName: 'top-6 right-6',
        contentClassName: size === 'default' ? 'top-[60px] -right-3' : 'top-[44px] -right-4',
      };
    }

    return {
      ...result,
      widgetContainerClassName: size === 'default' ? 'h-14 w-14' : 'h-10 w-10',
      widgetLogoSize: size === 'default' ? 42 : 32,
    };
  }, [props.widgetStyle?.position, props.widgetStyle?.size]);

  return (
    <div className={`fixed ${classes.containerClassName}`}>
      <div
        className={`${classes.widgetContainerClassName} rounded-full bg-black flex items-center justify-center cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <JupiterLogo width={classes.widgetLogoSize} height={classes.widgetLogoSize} />
      </div>

      <div
        id="integrated-terminal"
        className={`absolute overflow-hidden ${
          classes.contentClassName
        } flex flex-col w-[90vw] h-[600px] max-w-[384px] max-h-[75vh] rounded-2xl bg-jupiter-bg transition-opacity duration-300 shadow-2xl ${
          !isOpen ? 'h-0 opacity-0' : 'opacity-100'
        }`}
      >
        <RenderLoadableJupiter {...props} />
      </div>
    </div>
  );
};

async function init(props: IInit) {
  const { passThroughWallet, onSwapError, onSuccess, integratedTargetId, ...restProps } = props;

  // if (props.mode === 'outputOnly' && !props.mint) {
  //   throw new Error('outputOnly mode requires a mint!');
  // }

  const targetDiv = document.createElement('div');
  const instanceExist = document.getElementById(containerId);

  // If there's existing instance, just show it
  if (instanceExist) {
    window.Jupiter.root?.unmount();
    window.Jupiter._instance = null;
    instanceExist?.remove();
  }

  targetDiv.id = containerId;
  targetDiv.classList.add('w-full');
  targetDiv.classList.add('h-full');

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
    element = <RenderWidgetShell {...props} />;
  } else {
    element = <RenderShell {...props} />;
  }
  const root = createRoot(targetDiv);
  root.render(element);
  window.Jupiter.root = root;
  window.Jupiter._instance = element;

  // Passthrough & Callbacks
  window.Jupiter.passThroughWallet = passThroughWallet;
  window.Jupiter.onSwapError = onSwapError;
  window.Jupiter.onSuccess = onSuccess;
}

const attributes = (document.currentScript as HTMLScriptElement)?.attributes;
if (typeof window !== 'undefined') {
  document.onreadystatechange = function () {
    const loadComplete = document.readyState === 'complete';
    const shouldPreload = Boolean(attributes.getNamedItem('data-preload'));

    if (loadComplete && shouldPreload) {
      setTimeout(() => {
        preloadJupiter();
      }, 2000);
    }
  };
}

const resume = () => {
  const instanceExist = document.getElementById(containerId);
  if (instanceExist) {
    instanceExist.classList.remove('hidden');
    instanceExist.classList.add('block');
    return;
  }
};

const close = () => {
  const targetDiv = document.getElementById(containerId);
  if (targetDiv) {
    targetDiv.classList.add('hidden');
  }
};

export { init, resume, close };
