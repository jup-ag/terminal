import { init as ogInit, resume, close, appProps, syncProps } from './library';
import { IInit } from './types';

import { RenderJupiter } from '.';

async function init(props: IInit) {
  // Populate Jupiter object into window object
  (window as any).Jupiter = { init, resume, close, appProps, syncProps };
  // Populate JupiterRenderer into window object
  (window as any).JupiterRenderer = {
    RenderJupiter: RenderJupiter,
  };

  // Call original init function
  await ogInit(props);
}

export { init, resume, close, appProps, syncProps };
