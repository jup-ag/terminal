import Link from 'next/link';
import DiscordIcon from 'src/icons/DiscordIcon';
import GithubIcon from 'src/icons/GithubIcon';
import TwitterIcon from 'src/icons/TwitterIcon';
import { DocIcon } from 'src/icons/DocIcon';
import JupiterLogoV2 from 'src/icons/JupiterLogoV2';

const Footer = () => {
  return (
    <footer className="flex text-center justify-center text-xs text-white flex-row gap-x-5 mb-4">
      <Link href="https://jup.ag" target="_blank" className="items-center justify-center  w-5 h-5">
        <JupiterLogoV2 width={20} height={20} />
      </Link>
      <Link href="https://twitter.com/jupiterexchange" target="_blank" className="items-center justify-center  w-5 h-5">
        <TwitterIcon width={20} height={20} />
      </Link>
      <Link href="https://discord.gg/jup" target="_blank" className="items-center justify-center  w-5 h-5">
        <DiscordIcon width={20} height={20} />
      </Link>
      <Link href="https://github.com/jup-ag/plugin" target="_blank" className="items-center justify-center  w-5 h-5">
        <GithubIcon width={20} height={20} />
      </Link>
      <Link
        href="https://dev.jup.ag/docs/tool-kits/plugin"
        target="_blank"
        className="items-center justify-center  w-5 h-5"
      >
        <DocIcon width={20} height={20} />
      </Link>
    </footer>
  );
};

export default Footer;
