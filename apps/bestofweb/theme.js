import { default as defaultTheme } from "@peersky/next-web3-chakra/theme/";

import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  ...defaultTheme,
  //Here can override library theme items
});

export default theme;
