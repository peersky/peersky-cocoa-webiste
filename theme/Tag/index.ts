const subtleVariant = (props: any) => {
  return {
    bg: `white.200`,
    boxShadow: "sm",
    transition: "0.1s",
    _hover: {
      bg: `white.300`,
    },
  };
};

const Tag = {
  parts: ["container", "label", "closeButton"],
  baseStyle: {
    container: {
      m: 1,
    },
  },

  variants: {
    subtle: (props: any) => ({
      container: subtleVariant(props),
    }),
  },
};

export default Tag;
