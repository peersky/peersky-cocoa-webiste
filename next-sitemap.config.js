/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://peersky.xyz",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    includeNonIndexSitemaps: true,
  },
  generateIndexSitemap: false,
  transform: (config, path) => {
    return {
      loc: path.endsWith("/") ? path : path + "/", // => this will be exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
