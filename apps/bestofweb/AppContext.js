import React, { useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import {
  UIProvider,
  Web3Provider,
} from "@peersky/next-web3-chakra/dist/providers";
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
      <Web3Provider>
        <ProSidebarProvider>
          <UIProvider config={{ SITEMAP: SITEMAP }}>
            {props.children}
          </UIProvider>
        </ProSidebarProvider>
      </Web3Provider>
    </ChakraProvider>
  );
};

export default AppContext;
