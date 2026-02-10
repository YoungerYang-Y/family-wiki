import { createRequire } from 'node:module';
import { withContentlayer } from 'next-contentlayer2';

const require = createRequire(import.meta.url);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

export default withBundleAnalyzer(withContentlayer(nextConfig));
