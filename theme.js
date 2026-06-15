import _theme from "./theme/theme";

import { extendTheme } from "@chakra-ui/react";
const theme = extendTheme({
  ..._theme,
  fonts: {
    heading: `'Fraunces', 'Cormorant Garamond', Georgia, serif`,
    body: `'Inter', 'Work Sans', system-ui, sans-serif`,
    mono: `'JetBrains Mono', ui-monospace, monospace`,
  },
  //Here can override library theme items
});

export default theme;
