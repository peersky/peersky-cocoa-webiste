// import { mode, transparentize } from "@chakra-ui/theme-tools"
import { mode, transparentize } from "@chakra-ui/theme-tools";
const variantAccountMenu = (props) => {
  const { colorScheme: c } = props;

  return {
    width: "100%",
    w: "100%",
    borderRadius: "0px",
    borderStyle: "solid",
    borderTopWidth: "1px",
    bgColor: `white.200`,
    borderColor: `grey.100`,
    color: `black.100`,
    m: 0,
    _hover: {
      bg: `white.300`,
      // color: `white.100`,
    },
    _focus: {
      textDecoration: "underline",
      outline: "none",
      // color: `white.100`,
    },
    _active: {
      textDecoration: "none",
      // bg: `${c}.200`,
      // color: `white.100`,
      _before: {
        position: "absolute",
        content: "''",
        top: "0",
        bottom: "0",
        left: "0",
        width: "0.5rem",
        backgroundColor: `${c}.400`,
      },
      _last: {
        _before: {
          borderBottomLeftRadius: "md",
        },
      },
    },
    _last: {
      my: "-1px",
      borderBottomWidth: "1px",
      boxSizing: "border-box",
      borderBottomRadius: "md",
    },
  };
};

const variantLink = (props) => {
  const { colorScheme: c } = props;
  return {
    textColor: mode("grey.800", "whiteAlpha.700")(props),
    _focus: {
      textDecoration: "underline",
    },
  };
};

const variantMenuButton = (props) => {
  const { colorScheme: c } = props;
  // const bgColor = transparentize(`${c}.900`, 0.1)(props);
  return {
    _active: { borderBottomRadius: "0", mb: "0" },
    borderBlock: "Window",
    borderWidth: "3px",
    bg: mode(`${c}.200`, `${c}.900`)(props),
    boxSizing: "border-box",
    // color: `${c}.900`,
    textColor: mode(`${c}.900`, `${c}.400`)(props),
    _hover: {
      boxShadow: "md",
    },
    _focus: {
      textDecoration: "underline",
    },
  };
};

const variantOutline = (props) => {
  const { colorScheme: c } = props;
  return {
    borderColor: mode(`${c}.400`, `${c}.400`)(props),
    // borderWidth: `0.125rem`,
    // textColor: mode(`${c}.700`, "whiteAlpha.700")(props),
    borderWidth: "3px",
    boxSizing: "border-box",
    // textColor: mode(`${c}.400`, `${c}.400`)(props),
    textColor: mode(`${c}.100`, `${c}.400`)(props),
    _hover: {
      boxShadow: "md",
      bg: mode(`${c}.400`, `${c}.800`)(props),
    },
    _focus: {
      textDecoration: "underline",
    },
  };
};
const variantSolid = (props) => {
  const { colorScheme: c } = props;
  return {
    bg: mode(`${c}.400`, `${c}.700`)(props),
    textColor: mode(`${c}.0`, `${c}.100`)(props),
    _focus: {
      textDecoration: "underline",
    },
    _disabled: {
      bg: mode(`${c}.400`, `${c}.400`)(props),
    },
    _hover: {
      bg: mode(`${c}.500`, `${c}.600`)(props),
      // color: `${c}.100`,
      _disabled: {
        bg: mode(`${c}.500`, `${c}.300`)(props),
      },
    },
  };
};

const variantGhost = (props) => {
  const { colorScheme: c } = props;

  return {
    // color: `white.100`,
    _focus: {
      textDecoration: "underline",
    },
    _disabled: {
      bg: `${c}.50`,
    },
    _hover: {
      // bg: `${c}.600`,
      _disabled: {
        bg: `${c}.100`,
      },
    },
  };
};

const Button = {
  // 1. We can update the base styles
  baseStyle: (props) => {
    const { colorScheme: c } = props;
    return {
      // backgroundColor: `${c}.500`,
      px: "1rem",
      py: "1rem",
      transition: "0.1s",
      width: "fit-content",
      borderRadius: "full",
      borderStyle: "solid",
      fontWeight: "600",
      m: 1,
      _focus: { boxShadow: "none", outline: "none" },
    };
  },
  // 2. We can add a new button size or extend existing
  sizes: {
    xl: {
      h: 16,
      minW: 16,
      fontSize: "4xl",
      px: 8,
    },
  },
  // 3. We can add a new visual variant
  variants: {
    accountMenu: variantAccountMenu,
    solid: variantSolid,
    ghost: variantGhost,
    outline: variantOutline,
    link: variantLink,
    menu: variantMenuButton,
  },
};
export default Button;
