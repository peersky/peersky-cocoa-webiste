import { mode, transparentize } from "@chakra-ui/theme-tools";

const Menu = {
  parts: ["list", "item"],
  baseStyle: (props) => {
    const { colorScheme: c } = props;
    return {
      item: {
        placeContent: "center",
        w: "full",
        px: 6,
        mx: 0,
        placeContent: "space-between",
        // fontWeight: "medium",
        // lineHeight: "normal",
        // textColor: mode(`${c}.200`, `${c}.900`)(props),

        _hover: {
          // bg: mode(`${c}.800`, `${c}.200`)(props),
          // textColor: mode(`${c}.100`, `${c}.900`)(props),
        },
        _focus: {
          // bg: `${c}.700`,
          // textColor: `${c}.100`,
        },
      },
      list: {
        bg: mode(`${c}.200`, `${c}.900`)(props),
        borderColor: mode(`${c}.50`, `${c}.800`)(props),
        // w: "inherit",
        borderTopRadius: 0,
        borderTopWidth: 0,
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderBottomRadius: "50%",
        pb: 10,
        // borderWidth: 0,
        // position: "0",
        // borderBlock: "Window",
      },
    };
  },
};

export default Menu;
