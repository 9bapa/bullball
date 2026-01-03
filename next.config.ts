import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: [
    '@dynamic-labs/sdk-react-core',
    '@dynamic-labs/solana',
    '@dynamic-labs/wallet-connect',
    'thread-stream',
    'pino'
  ],
  turbopack: {
    // Turbopack configuration
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    
    // Exclude test files from being bundled
    config.module.rules.push({
      test: /\.(test|spec)\.(js|ts|tsx|jsx)$/,
      exclude: /node_modules/,
      use: 'ignore-loader'
    })

    // Exclude problematic dependencies
    config.externals = config.externals || []
    config.externals.push({
      'tap': 'commonjs tap',
      'tape': 'commonjs tape',
      'why-is-node-running': 'commonjs why-is-node-running'
    })

    return config
  }
};

export default nextConfig;
