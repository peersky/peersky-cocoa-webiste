import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html
        lang="en"
        style={{ width: "100%", height: "100%", fontSize: "16px" }}
      >
        <Head>
          <meta name="theme-color" content="#F4EFE6" />
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.png" />
          <link
            rel="alternate"
            type="application/rss+xml"
            title="Peersky — Writing (RSS)"
            href="/feed.xml"
          />
          <meta
            name="robots"
            content={
              process.env.NEXT_PUBLIC_BUILD_TARGET === "alpha"
                ? "noindex"
                : "all"
            }
          />
          <meta name="author" content="Peersky" />
          <link rel="apple-touch-icon" href="/favicon.png" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
