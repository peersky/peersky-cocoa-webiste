import { ComponentStyleConfig } from "@chakra-ui/react";

const variantOutline = () => {
  return {
    container: {
      bg: "black",
      color: "yellow",
    },
  };
};

const Badge: ComponentStyleConfig = {
  parts: ["container", "label", "closeButton"],
  variants: {
    outline: variantOutline,
  },
};
export default Badge;
