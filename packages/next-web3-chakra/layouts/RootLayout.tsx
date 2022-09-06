// import { CloseIcon } from "@chakra-ui/icons";
import { Flex, chakra,
  //  Center, Text, Link, IconButton
   } from "@chakra-ui/react";
import React, { Suspense, useContext, useState } from "react";
import UIContext from "../providers/UIProvider/context";
// const Sidebar = React.lazy(() => import("../components/Sidebar"));
const Navbar = React.lazy(() => import("../components/Navbar"));

const _RootLayout = ({navbarBG, children, ...props}: {children: React.ReactNode, navbarBG?: string}) => {
  const ui = useContext(UIContext);
  const [showBanner, setShowBanner] = useState(false);

  return (
    <Flex
      direction="row"
      id="PeerApp"
      className="Main"
      w="100%"
      h="100%"

      maxH="100%"
      bgColor={"blue.1200"}
    >
      {/* <Suspense fallback="">
        <Sidebar />
      </Suspense> */}
      <Flex
        direction="column"
        flexGrow={1}
        flexBasis="100px"
        overflowX="hidden"
        minH="100vh"
      >
        <Suspense fallback="">
          <Navbar bgColor={navbarBG} {...props} />
        </Suspense>

        {children}
      </Flex>
    </Flex>
  );
};

export const getLayout = (page: React.ReactNode) => (
  <RootLayout>{page}</RootLayout>
);

const RootLayout = chakra(_RootLayout)
export default RootLayout;
