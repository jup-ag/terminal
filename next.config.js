const libs = ['@solana/wallet-adapter-base'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    if (!isServer) config.resolve.fallback.fs = false;
    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: libs,
};

module.exports = nextConfig;
