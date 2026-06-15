export * as AppLayout from "./AppLayout";
export * as BlogLayout from "./BlogLayout";
import { chakra, Flex, type ChakraProps } from "@chakra-ui/react";
import { Suspense } from "react";
import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Scrollable from "../components/Scrollable";

interface LayoutProps extends ChakraProps {
  children: JSX.Element;
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
      <Flex
        mt="64px"
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
export const getLayout = (page: JSX.Element) => (
  <LayoutWrapper>{page}</LayoutWrapper>
);

export default LayoutWrapper;
