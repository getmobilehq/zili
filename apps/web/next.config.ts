import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zili/shared-types'],
  // Monorepo root, so file tracing ignores stray lockfiles elsewhere on disk.
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
};

export default nextConfig;
