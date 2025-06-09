// src/components/ShadowDomContainer.tsx

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: React.ReactNode;
  stylesheetUrls: string[];
  // Include the Google Font link to be injected into the shadow root
  fontHref: string;
}

export const ShadowDomContainer: React.FC<Props> = ({ children, stylesheetUrls, fontHref }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  useEffect(() => {
    if (hostRef.current && !shadowRoot) {
      // 1. Create the shadow root
      const newShadowRoot = hostRef.current.attachShadow({ mode: 'open' });
      // 2. Create a container inside the shadow root for React to render into

      // 3. Inject the Google Fonts stylesheet
      //   const fontLinkEl = document.createElement('link');
      //   fontLinkEl.rel = 'stylesheet';
      //   fontLinkEl.href = fontHref;
      //   newShadowRoot.appendChild(fontLinkEl);

      // 4. Inject all required CSS stylesheets into the shadow root
      //   stylesheetUrls.forEach(url => {
      //     const linkEl = document.createElement('link');
      //     linkEl.rel = 'stylesheet';
      //     linkEl.href = url;
      //     newShadowRoot.appendChild(linkEl);
      //   });

      const loadStyles = async () => {
        try {
          // Combine the font URL with the other stylesheet URLs
          const allStyleUrls = stylesheetUrls;

          // Fetch all stylesheets as text
          const stylePromises = allStyleUrls.map((url) =>
            fetch(url).then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to fetch stylesheet: ${url}`);
              }
              return res.text();
            }),
          );

          const allCssText = await Promise.all(stylePromises);

          // Create a single <style> tag and inject all the CSS
          const styleEl = document.createElement('style');
          styleEl.textContent = allCssText.join('\n\n/* --- Stylesheet Separator --- */\n\n');

          newShadowRoot.appendChild(styleEl);
          const portalContainer = document.createElement('div');
          portalContainer.id = 'portal-container';
          portalContainer.style.width = '100%';
          portalContainer.style.height = '100%';
          newShadowRoot.appendChild(portalContainer);

          console.log('All styles fetched and injected into a <style> tag.');
          setStylesLoaded(true);
        } catch (error) {
          console.error('Error fetching and applying styles:', error);
        }
      };
      loadStyles();
     
      setShadowRoot(newShadowRoot);
    }
  }, [hostRef, shadowRoot, stylesheetUrls, fontHref, setStylesLoaded]);

  const portalTarget = shadowRoot?.getElementById('portal-container');

  return (
    <div ref={hostRef} style={{ width: '100%', height: '100%' }}>
      {portalTarget && stylesLoaded ? createPortal(children, portalTarget) : null}
    </div>
  );
};
