import { theme as _theme } from "@peersky/next-web3-chakra";

import { extendTheme } from "@chakra-ui/react";
const theme = extendTheme({
  ..._theme,
  fonts: {
    Headings: `'JetBrains Mono', monospace`,
    body: `'JetBrains Mono', monospace`,
  },
  //Here can override library theme items
});

export default theme;
