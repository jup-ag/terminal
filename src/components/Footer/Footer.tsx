import Link from 'next/link';
import DiscordIcon from 'src/icons/DiscordIcon';
import TwitterIcon from 'src/icons/TwitterIcon';

const Footer = () => {
  return (
    <footer className="flex text-center justify-center items-center p-2.5 text-xs text-white space-x-2">
      <Link href="https://twitter.com/jupiterexchange" target='_blank'>
        <TwitterIcon />
      </Link>

      <Link href="https://discord.gg/jup" target='_blank'>
        <DiscordIcon />
      </Link>
    </footer>
  );
};

export default Footer;
