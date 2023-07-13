import React, { Suspense, lazy } from "react";
import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/BlogLayout";
const Home = () => {
  const Component = lazy(() => import(`../content/landing.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};
Home.getLayout = getLayout();
export default Home;
