import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: React.ReactNode;
  stylesheetUrls: string[];
}

export const ShadowDomContainer: React.FC<Props> = ({ children, stylesheetUrls }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    if (hostRef.current && !shadowRoot) {
      // 1. Create the shadow root
      const newShadowRoot = hostRef.current.attachShadow({ mode: 'open' });

      const loadStyles = async () => {
        try {
          // Fetch all stylesheets as text
          const stylePromises = stylesheetUrls.map((url) =>
            fetch(url).then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to fetch stylesheet: ${url}`);
              }
              return res.text();
            }),
          );

          const allCssText = await Promise.all(stylePromises);

          // Inject all stylesheets
          allCssText.forEach((cssText) => {
            const styleEl = document.createElement('style');
            styleEl.textContent = cssText;
            newShadowRoot.appendChild(styleEl);
          });

          setStylesLoaded(true);
        } catch (error) {
          console.error('Error fetching and applying styles:', error);
        }
      };

      loadStyles();
      // Create container for React portal
      const portalContainer = document.createElement('div');
      portalContainer.id = 'portal-container';
      portalContainer.style.width = '100%';
      portalContainer.style.height = '100%';
      newShadowRoot.appendChild(portalContainer);

      setShadowRoot(newShadowRoot);
    }
  }, [hostRef, shadowRoot, stylesheetUrls]);

  const portalTarget = shadowRoot?.getElementById('portal-container');

  return (
    <div ref={hostRef} >
      {portalTarget && stylesLoaded ? createPortal(children, portalTarget) : null}
    </div>
  );
};
