import React, { useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import UIProvider from "./providers/UIProvider";
// import Fonts from "./Theme/Fonts";
import { SITEMAP } from "./config";
import { ProSidebarProvider } from "react-pro-sidebar";
const AppContext = (props) => {
  useEffect(() => {
    const version = "0.35";
    if (version) console.log(`Frontend version: ${version}`);
    else console.error("version variable is not set");
  }, []);

  return (
    <ChakraProvider theme={theme}>
      {/* <Fonts /> */}
      <ProSidebarProvider>
        <UIProvider config={{ SITEMAP: SITEMAP }}>{props.children}</UIProvider>
      </ProSidebarProvider>
    </ChakraProvider>
  );
};

export default AppContext;
