/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")(["@peersky/next-web3-chakra"]);
module.exports = withTM(
  {
    reactStrictMode: true,
    trailingSlash: true,
    presets: [require.resolve("next/babel")],
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
    },
  },
  [, { resolveSymlinks: false }]
);
