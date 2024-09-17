import { useCallback, useMemo, useState } from 'react';

import { Placement, PositioningStrategy } from '@popperjs/core';
import { usePopper } from 'react-popper';
import debounce from 'lodash.debounce';
import { cn } from 'src/misc/cn';
import { useMobile } from 'src/hooks/useMobile';
import { useOutsideClick } from 'src/misc/utils';

interface IPopoverProps {
  id: string;
  buttonContent: React.ReactNode;
  popoverContent: React.ReactNode | null;
  placement: Placement;
  trigger?: 'click' | 'hover';
  /* popover stay open onClick, normally it's for where popover text is intended to be read by users */
  persistOnClick?: boolean;
  contentClassName?: string;
  buttonContentClassName?: string;
  strategy?: PositioningStrategy;
  isOpen?: boolean;
  onClose?: () => void;
  matchWidth?: boolean;
  offset?: [number, number];
  arrow?: boolean;
  drawShades?: boolean;
}

const Popover: React.FunctionComponent<IPopoverProps> = ({
  placement = 'auto',
  trigger = 'click',
  persistOnClick = true,
  strategy = 'fixed',
  arrow = false,
  buttonContent,
  popoverContent,
  contentClassName,
  buttonContentClassName,
  isOpen,
  onClose,
  matchWidth,
  offset,
  drawShades = false,
}) => {
  const isLocalMode = useMemo(
    () => typeof isOpen === 'undefined',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const isMobile = useMobile();
  const [localOpen, setLocalOpen] = useState<boolean>(isLocalMode ? false : true);

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const shouldShowArrow = useMemo(() => Boolean(popoverContent) && arrow, [popoverContent, arrow]);

  const modifiers = offset
    ? [
        {
          name: 'offset',
          options: {
            offset,
          },
        },
      ]
    : undefined;
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy,
    placement,
    modifiers,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleClose = useCallback(
    debounce(
      () => {
        if (isLocalMode) {
          setLocalOpen(false);
        } else if (onClose) {
          onClose();
        }
      },
      // persistOnClick makes sure Tooltip stays open when user click on it
      // to make sure that if user hover to content, we don't close it
      trigger === 'hover' && persistOnClick ? 50 : 0,
    ),
    [setLocalOpen, isLocalMode, onClose, trigger, persistOnClick],
  );

  const handleOpen = useCallback(() => {
    handleClose.cancel();
    setLocalOpen(true);
  }, [setLocalOpen, handleClose]);

  useOutsideClick({ current: popperElement }, handleClose);

  const onClick = () => {
    if (isLocalMode) {
      if ((persistOnClick && trigger === 'hover') || trigger === 'click') {
        handleOpen();
      }
    } else if (isOpen && onClose) {
      onClose();
    }
  };

  const shouldRenderContent = isLocalMode ? localOpen : isOpen;
  const hoverProps =
    trigger === 'hover'
      ? isMobile
        ? {
            onTouchStart: handleOpen,
            onTouchEnd: handleClose,
          }
        : {
            onMouseEnter: handleOpen,
            onMouseLeave: handleClose,
          }
      : {};

  return (
    <>
      <div
        ref={setReferenceElement}
        onClick={onClick}
        className={cn(buttonContentClassName, {
          'z-50': shouldRenderContent,
        })}
        {...hoverProps}
      >
        {buttonContent}
      </div>
      {shouldRenderContent && (
        <div
          id="tooltip"
          ref={setPopperElement}
          style={{ ...styles.popper, maxWidth: matchWidth ? referenceElement?.clientWidth : 'auto' }}
          {...attributes.popper}
          {...hoverProps}
          className={cn(
            'rounded-lg w-auto bg-none shadow-xl dark:bg-white/5 backdrop-blur-xl transition-opacity opacity-0',
            contentClassName,
            {
              'z-50 opacity-100': shouldRenderContent,
            },
          )}
        >
          {popoverContent}
          {shouldShowArrow ? (
            <div
              id="arrow"
              className="before:absolute absolute before:w-2 w-2 before:h-2 h-2 before:bg-inherit bg-inherit before:visible before:rotate-45 invisible"
              data-popper-arrow
            ></div>
          ) : null}
        </div>
      )}

      <div
        className={cn('fixed top-0 left-0 w-full h-full transition-all opacity-0 pointer-events-none z-[-1]', {
          '!backdrop-blur-xxs !bg-black/20 opacity-100 pointer-events-auto z-40': drawShades && shouldRenderContent,
        })}
        onClick={handleClose}
      />
    </>
  );
};

export default Popover;
