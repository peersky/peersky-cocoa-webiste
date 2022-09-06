import { Box, chakra } from "@chakra-ui/react";
import React from "react";
import Footer from "../components/Footer";
import Scrollable from "../components/Scrollable";
import RootLayout from "./RootLayout";

const _LayoutWrapper = ({ children, ...props }: { children: React.ReactNode}) => {
  return (
    <RootLayout {...props}>
      <Scrollable>
        <Box minH="100vh">

        {children}
        </Box>
        <Footer />
      </Scrollable>
    </RootLayout>
  );
};

const LayoutWrapper = chakra(_LayoutWrapper);
export const getLayout = (page: React.ReactNode) => <LayoutWrapper>{page}</LayoutWrapper>;

export default LayoutWrapper;
