export * as AppLayout from "./AppLayout";
export * as BlogLayout from "./BlogLayout";
export * as ContractLayout from "./ContractLayout";
import { Box, chakra, Flex } from "@chakra-ui/react";
import { Suspense } from "react";
import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Scrollable from "../components/Scrollable";
import _Sidebar from "../components/Sidebar";
// import RootLayout from "./RootLayout";

const _LayoutWrapper = ({
  children,
  ...props
}: {
  children: React.ReactNode;
}) => {
  return (
    // <RootLayout {...props}>

    <Scrollable className="Main">
      <Navbar

      // colorScheme={components.Navbar.colorScheme}
      />
      {/* <Flex
         direction="row"
         id="PeerApp"
         className="Main"
         w="100%"
         h="100%"
         maxH="100%"
       > */}
      {/* <Suspense fallback="">
       </Suspense> */}
      <_Sidebar />
      <Flex
        mt="84px"
        direction="column"
        flexGrow={1}
        flexBasis="100px"
        overflowX="hidden"
        // overflowY={"scroll"}
      >
        <Suspense fallback=""></Suspense>
        {/* <Flex> </Flex> */}
        {children}
      </Flex>
      {/* </Flex> */}
      {/* <Footer /> */}
      <Footer />
    </Scrollable>
    // </RootLayout>
  );
};

const LayoutWrapper = chakra(_LayoutWrapper);
export const getLayout = (page: React.ReactNode) => (
  <LayoutWrapper>{page}</LayoutWrapper>
);

export default LayoutWrapper;
export * as AppLayout from "./AppLayout";
export * as BlogLayout from "./BlogLayout";
export * as ContractLayout from "./ContractLayout";
export * as DefaultLayout from "./index";
