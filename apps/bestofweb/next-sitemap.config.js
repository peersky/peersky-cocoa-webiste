/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://peersky.xyz",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    includeNonIndexSitemaps: true,
  },
};
