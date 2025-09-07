export * as AppLayout from "./AppLayout";
export * as BlogLayout from "./BlogLayout";
export * as ContractLayout from "./ContractLayout";
import { chakra, Flex, type ChakraProps } from "@chakra-ui/react";
import { Suspense } from "react";
import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Scrollable from "../components/Scrollable";
import _Sidebar from "../components/Sidebar";
// import RootLayout from "./RootLayout";

interface LayoutProps extends ChakraProps {
  children: React.ReactNode;
  selectorSchema?: string;
  metamaskSchema?: string;
  colorScheme?: string;
}

const _LayoutWrapper = (props: LayoutProps) => {
  const { children, selectorSchema, metamaskSchema, colorScheme, ...rest } =
    props;
  return (
    <Scrollable className="Main" {...rest}>
      <Navbar
        selectorSchema={selectorSchema}
        metamaskSchema={metamaskSchema}
        colorScheme={colorScheme}
      />
      <_Sidebar
        selectorSchema={selectorSchema}
        metamaskSchema={metamaskSchema}
        colorScheme={colorScheme}
      />
      <Flex
        mt="84px"
        direction="column"
        flexGrow={1}
        flexBasis="100px"
        overflowX="hidden"
      >
        <Suspense fallback=""></Suspense>
        {children}
      </Flex>
      <Footer colorScheme={colorScheme} />
    </Scrollable>
  );
};

const LayoutWrapper = chakra(_LayoutWrapper);
export const getLayout = (page: React.ReactNode) => (
  <LayoutWrapper>{page}</LayoutWrapper>
);

export default LayoutWrapper;
