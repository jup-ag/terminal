import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="flex text-center justify-center items-center p-2.5 bg-[#EBEFF1] dark:bg-[#2E2E37] text-xs text-black/35 dark:text-white/35">
      <Link href="https://jup.ag" target="_blank">
        Jupiter: The Key Liquidity Aggregator and Swap Infrastructure for
        Solana
      </Link>
    </footer>
  );
};

export default Footer;
