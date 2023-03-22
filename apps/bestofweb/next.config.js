/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const withMDX = require("@next/mdx")();
module.exports = withMDX({
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  transpilePackages: ["@peersky/next-web3-chakra"],
  reactStrictMode: true,
  trailingSlash: true,
  // output: "standalone",
  // target: "serverless",
  webpack: (config, { isServer, webpack }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      // config.node = { fs: 'empty' };
      config.resolve.fallback.fs = false;
      config.resolve.fallback.electron = false;
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^electron$/,
      })
    );

    return config;
  },
  experimental: {
    externalDir: true,
    esmExternals: false,
  },
});
