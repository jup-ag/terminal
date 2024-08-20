import { forwardRef, PropsWithChildren, useMemo } from 'react';
import { usePreferredExplorer } from 'src/contexts/preferredExplorer';
import External from 'src/icons/External';
import { cn } from 'src/misc/cn';
import { shortenAddress } from 'src/misc/utils';

interface ComponentProps extends PropsWithChildren {
  address: string;
  className?: string;
}

const AccountLink = forwardRef<HTMLAnchorElement, ComponentProps>((props, ref) => {
  const { address, className, children } = props;

  const { getTokenExplorer } = usePreferredExplorer();

  const { href, shortAddr } = useMemo(() => {
    const link = getTokenExplorer(address);

    return {
      href: link,
      shortAddr: shortenAddress(address, 5),
    };
  }, [address, getTokenExplorer]);

  return (
    <a
      ref={ref}
      target="_blank"
      rel="noreferrer"
      href={href}
      className={cn(
        'flex items-center bg-jupiter-bg-grey bg-black/25 text-white/75 px-2 py-0.5 space-x-1 rounded cursor-pointer',
        className,
      )}
    >
      {children || (
        <>
          <div className="text-xxs">{shortAddr}</div>
          <External width={10} height={10} />
        </>
      )}
    </a>
  );
});

AccountLink.displayName = 'AccountLink';

export default AccountLink;
