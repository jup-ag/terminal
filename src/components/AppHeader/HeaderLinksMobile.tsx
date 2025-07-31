import Link from 'next/link';
import React from 'react';
import DiscordIcon from 'src/icons/DiscordIcon';
import RepoLogo from 'src/icons/RepoLogo';
import SwapIcon from 'src/icons/SwapIcon';

const HeaderLink: React.FC<{
  external?: boolean;
  href: string;
  icon: React.ReactNode;
  label: string | React.ReactNode;
}> = ({ external, href, icon, label }) => {
  return (
    <Link
      href={href}
      shallow
      className="bg-white/10 flex items-center px-5 py-4 rounded-xl"
      {...(external
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
          }
        : {})}
    >
      <span className="flex items-center justify-center h-9 w-9 rounded-full text-white/50 fill-current bg-black/25">
        {icon}
      </span>
      <p className="ml-5 font-medium">{label}</p>
    </Link>
  );
};

const HeaderLinksMobile: React.FC = () => {
  return (
    <div className="px-5 py-4 text-base text-white space-y-2">
      <HeaderLink href="/" label={'Demo'} icon={<SwapIcon width="20" height="20" />} />
      <HeaderLink
        href="https://github.com/jup-ag/plugin"
        external
        label={'Repo'}
        icon={<RepoLogo width="20" height="20" />}
      />
      <HeaderLink
        href="https://discord.gg/jup"
        external
        label={'Discord'}
        icon={<DiscordIcon width="20" height="20" />}
      />
    </div>
  );
};

export default HeaderLinksMobile;
