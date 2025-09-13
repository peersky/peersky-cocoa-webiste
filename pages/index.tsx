import React, { Suspense, lazy } from "react";
import { Flex } from "@chakra-ui/react";
import { getLayout as getBlogLayout } from "../layouts/BlogLayout";
const Home = () => {
  const Component = lazy(() => import(`../content/landing.mdx`));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {
        <Flex px={4} direction={"column"}>
          <Component />
        </Flex>
      }
    </Suspense>
  );
};
Home.getLayout = getBlogLayout();
export default Home;
