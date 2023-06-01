import React, { useEffect, useState } from "react";
import "../styles/styles.css";
import "../styles/nprogress.css";
// import "../styles/sidebar.css";
import dynamic from "next/dynamic";
import HeadSEO from "@peersky/next-web3-chakra/components/HeadSEO";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
const AppContext = dynamic(() => import("../AppContext"), {
  ssr: false,
});
const DefaultLayout = dynamic(
  () => import("@peersky/next-web3-chakra/layouts"),
  {
    ssr: false,
    loading: () => <div>loading...</div>,
  }
);
// import DefaultLayout from "@peersky/next-web3-chakra/layouts";
import { useRouter } from "next/router";
import NProgress from "nprogress";
// import { WHITE_LOGO_W_TEXT_URL } from "../src/constants";
const baseURL = "https://peersky.xyz";
export default function CachingApp({ Component, pageProps }: any) {
  const [queryClient] = useState(new QueryClient());

  const router = useRouter();

  useEffect(() => {
    if (
      router.pathname !== "/entry-point" &&
      window &&
      localStorage.getItem("entry_point")
    ) {
      localStorage.removeItem("entry_point");
    }
  }, [router]);

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  const getLayout =
    Component.getLayout ||
    ((page: React.ReactNode) => (
      <DefaultLayout
        selectorSchema="grey"
        metamaskSchema="grey"
        navbarBG="grey.900"
      >
        {page}
      </DefaultLayout>
    ));

  const headLinks = [
    // { rel: "preload", as: "image", href: WHITE_LOGO_W_TEXT_URL },
  ];
  pageProps.preloads && headLinks.push(...pageProps.preloads);
  const defaultMetaTags = {
    title: "Personal Blog, Ideas, Apps and Utils",
    keywords: "blockchain, blog, ideas, dApps, peersky",
    description:
      "This is a personal web space, free of product placement and ads, where you can find content about blockchain as well as explore some dApps and Utils I develop",
    url: baseURL,
    image: baseURL + "/daocoacoa.png",
  };
  const metaTags = { ...defaultMetaTags, ...pageProps.metaTags };
  return (
    <>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100% !important;
          width: 100%;
          overflow: hidden;
        }
      `}</style>
      <HeadSEO baseURL={baseURL} {...metaTags} />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <AppContext>{getLayout(<Component {...pageProps} />)}</AppContext>
      </QueryClientProvider>
    </>
  );
}
