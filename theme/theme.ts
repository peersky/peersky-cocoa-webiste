import {
  extendTheme,
  useColorModeValue,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import Button from "./Button";
import Tag from "./Tag";
import Menu from "./Menu";
import Input from "./Input";
// import Spinner from "./Spinner";
import NumberInput from "./NumberInput";
import Badge from "./Badge";
import Checkbox from "./Checkbox";
import Table from "./Table";
import Tooltip from "./Tooltip";
import Spinner from "./Spinner";
import Heading from "./Heading";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
// import { createBreakpoints } from "@chakra-ui/theme-tools";

// const breakpointsCustom = createBreakpoints();

const Accordion = {
  parts: ["container", "panel", "button"],
  baseStyle: {
    container: { borderColor: "white.300" },
    panel: { pb: 4 },
  },
  // defaultProps: {
  //   size: "xl",
  //   item: { borderColor: "white.300" },
  // },
};

const theme = extendTheme(withDefaultColorScheme({ colorScheme: "blue" }), {
  breakpoints: {
    base: "24em",
    sm: "24em", //Mobile phone
    md: "64.01em", //Tablet or rotated phone
    lg: "89.9em", //QHD
    xl: "160em", //4k monitor
    "2xl": "192em", // Mac Book 16" and above
  },
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  defaultProps: {
    size: "lg", // default is md
    variant: "sm", // default is solid
    colorScheme: "grey", // default is grey
    // color: "grey.900",
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        // noolog White-Flame: white by day, negative-film navy + starfield by night
        bg: mode("#FFFFFF", "#060A18")(props),
        color: mode("#1D1D1F", "#EAF2FF")(props),
        backgroundImage: mode(
          "none",
          "radial-gradient(1px 1px at 20% 30%, rgba(147,166,196,.5), transparent), radial-gradient(1px 1px at 70% 20%, rgba(0,158,151,.35), transparent), radial-gradient(1px 1px at 45% 70%, rgba(191,233,255,.35), transparent), radial-gradient(1px 1px at 85% 60%, rgba(147,166,196,.4), transparent)"
        )(props),
        backgroundAttachment: "fixed",
        fontFeatureSettings: '"ss01", "ss02", "kern", "liga"',
        WebkitFontSmoothing: "antialiased",
      },
    }),
  },

  components: {
    Button,
    Accordion,
    Menu,
    Input,
    Tag,
    NumberInput,
    Badge,
    Checkbox,
    Table,
    Spinner,
    Tooltip,
    Heading,
    Link: {
      baseStyle: (props: StyleFunctionProps) => {
        return {
          textColor: mode("grey.700", "grey.200")(props),
          _hover: {
            textColor: mode("grey.900", "whiteAlpha.900")(props),
          },
        };
      },
    },
    Navbar: {
      colorScheme: "grey",
    },
    Footer: {
      colorScheme: "grey",
    },
  },

  logo: "daocoacoa.png",

  fonts: {
    heading:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
  },
  fontSizes: {
    xs: "0.625rem", //10px
    sm: "0.875rem", //14px
    md: "1rem", //16px
    lg: "1.25rem", //20px
    xl: "1.375rem", //22
    "2xl": "1.5rem", //24px
    "3xl": "1.625rem", //26
    "4xl": "1.875rem", //30px
    "5xl": "2.625rem", //42px
    "6xl": "3.75rem", //60px
    "7xl": "4.5rem", //72px
  },

  colors: {
    // "blue" is the site accent colorScheme — mapped to noolog consensus teal
    blue: {
      0: "#F0FBFA",
      50: "#E0F7F6",
      100: "#B3E9E7",
      200: "#80DAD6",
      300: "#4DCBC5",
      400: "#26BFB8",
      500: "#009E97",
      600: "#00807A",
      700: "#00615C",
      800: "#00423E",
      900: "#002321",
    },
    red: {
      0: "#FFFFF1",
      50: "#FDEDE8",
      100: "#F8CCBE",
      200: "#F4AB94",
      300: "#F08A6B",
      400: "#EC6941",
      500: "#E84817",
      600: "#B93A13",
      700: "#8B2B0E",
      800: "#5D1D09",
      900: "#2E0E05",
    },
    orange: {
      0: "#FFFFF1",
      50: "#FEECE7",
      100: "#FCCABB",
      200: "#FAA88F",
      300: "#F78663",
      400: "#F56438",
      500: "#F3420C",
      600: "#C2350A",
      700: "#922807",
      800: "#611A05",
      900: "#310D02",
    },
    yellow: {
      0: "#FFFFF0",
      50: "#FDF7E8",
      100: "#F8EABE",
      200: "#F4DC94",
      300: "#F0CE6B",
      400: "#ECC041",
      500: "#E8B217",
      600: "#B98F13",
      700: "#8B6B0E",
      800: "#5D4709",
      900: "#2E2405",
    },
    pink: {
      0: "#FFFFF1",
      50: "#FEF8E7",
      100: "#FCEBBB",
      200: "#FADF8F",
      300: "#F7D263",
      400: "#F5C538",
      500: "#F3B80C",
      600: "#C2940A",
      700: "#926F07",
      800: "#614A05",
      900: "#312502",
    },
    // dual-purpose ramp: Apple-neutral light end, negative-film navy dark end
    grey: {
      0: "#FFFFFF",
      50: "#F5F5F5",
      100: "#E5E5EA",
      200: "#D1D1D6",
      300: "#93A6C4",
      400: "#8E8E93",
      500: "#6E6E73",
      600: "#3A4A68",
      700: "#1E2C48",
      800: "#0C1226",
      900: "#060A18",
    },
  },
});

export default theme;
