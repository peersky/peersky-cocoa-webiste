import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
// const GTAG = process.env.NEXT_PUBLIC_ENGINE_GTAG;
const GTAG = "G-7M9KTD2D9E";

export default class MyDocument extends Document {
  render() {
    return (
      <Html
        lang="en"
        style={{ width: "100%", height: "100%", fontSize: "16px" }}
      >
        <Head>
          <Script Script id="google-analytics" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KJLR89H');`}
          </Script>
          <meta name="theme-color" content="#000000" />
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.png" />
          {/* {`<!-- robots -->`} */}
          <meta
            name="robots"
            content={
              process.env.NEXT_PUBLIC_BUILD_TARGET === "alpha"
                ? "noindex"
                : "all"
            }
          />
          <meta name="author" content="Peersky" />
          {/* {`<!-- resources -->`} */}
          <link rel="apple-touch-icon" href="/favicon.png" />
          {/* {`<!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->`} */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="preconnect" href="https://s3.amazonaws.com" />
          {/* <link rel="preload" as="font" href="/Virgil.woff2" crossOrigin="" /> */}
          {/* <link
            rel="preload"
            as="font"
            href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;500;600;700;800;900&display=swap"
          /> */}
          {/* <link
            href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          /> */}
          <link rel="preconnect" href="https://s3.amazonaws.com" />
          {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}

          {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GTAG}`}
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() {
                dataLayer.push(arguments);
              }
              gtag("js", new Date());
              gtag("config", "${GTAG}");`,
            }}
          />
        </Head>
        <body>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `src="https://www.googletagmanager.com/ns.html?id=GTM-KJLR89H"
              height="0"
              width="0"
              style="display:none;visibility:hidden"`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
