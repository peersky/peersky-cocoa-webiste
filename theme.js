import _theme from "./theme/theme";

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
