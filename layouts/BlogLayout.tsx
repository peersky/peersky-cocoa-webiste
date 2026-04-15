import { getLayout as getSiteLayout } from "./AppLayout";
import {
  Flex,
  Box,
  chakra,
  Heading,
  Text,
  Image,
  UnorderedList,
  ListItem,
  OrderedList,
  Link,
  Tag,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { MDXProvider } from "@mdx-js/react";

const H1 = (props: any) => (
  <Heading
    as="h1"
    size="2xl"
    mt={10}
    mb={4}
    letterSpacing="-0.02em"
    lineHeight="1.2"
  >
    {props.children}
  </Heading>
);
const H2 = (props: any) => (
  <Heading
    as="h2"
    size="xl"
    mt={10}
    mb={4}
    pb={2}
    borderBottomWidth="1px"
    borderColor={useColorModeValue("grey.100", "grey.700")}
    letterSpacing="-0.01em"
  >
    {props.children}
  </Heading>
);
const H3 = (props: any) => (
  <Heading as="h3" size="lg" mt={8} mb={3} letterSpacing="-0.01em">
    {props.children}
  </Heading>
);

const H4 = (props: any) => (
  <Heading as="h4" size="md" mt={6} mb={2} fontWeight="semibold">
    {props.children}
  </Heading>
);

const P = (props: any) => (
  <Text fontSize="md" lineHeight="1.8" my={3} color={useColorModeValue("grey.700", "grey.200")}>
    {props.children}
  </Text>
);

const Blockquote = (props: any) => (
  <Box
    as="blockquote"
    borderLeftWidth="3px"
    borderColor={useColorModeValue("blue.400", "blue.300")}
    pl={4}
    py={1}
    my={6}
    color={useColorModeValue("grey.600", "grey.300")}
    fontStyle="italic"
    sx={{ "& p": { my: 1 } }}
  >
    {props.children}
  </Box>
);

const Code = (props: any) => (
  <chakra.code
    fontSize="0.9em"
    px="0.3em"
    py="0.15em"
    borderRadius="4px"
    bg={useColorModeValue("grey.50", "grey.800")}
    color={useColorModeValue("blue.700", "blue.200")}
    fontFamily="'JetBrains Mono', monospace"
  >
    {props.children}
  </chakra.code>
);

const Pre = (props: any) => (
  <Box
    as="pre"
    my={6}
    p={4}
    borderRadius="8px"
    bg={useColorModeValue("grey.900", "grey.800")}
    color="grey.100"
    overflowX="auto"
    fontSize="sm"
    lineHeight="1.6"
    sx={{
      "& code": {
        bg: "transparent",
        color: "inherit",
        px: 0,
        py: 0,
        fontSize: "inherit",
      },
    }}
  >
    {props.children}
  </Box>
);

const Hr = () => (
  <Divider my={8} borderColor={useColorModeValue("grey.200", "grey.700")} />
);

const ResponsiveImage = (props: any) => {
  const captionColor = useColorModeValue("grey.500", "grey.400");
  const docsImportPath = "../apps/bestofweb/public";
  const imgSrc = !props.src.startsWith(docsImportPath)
    ? props.src
    : props.src.slice(docsImportPath.length);

  const alt = props.alt ?? "";
  const cleanAlt = alt.replace(/-(fullwidth|small|medium)$/, "");
  const caption = props.title || cleanAlt || undefined;

  return (
    <Flex as="figure" direction="column" alignItems="center" my={6} mx={0}>
      <Image
        alt={alt}
        src={imgSrc}
        borderRadius="6px"
        w={
          alt.endsWith("fullwidth")
            ? "100%"
            : alt.endsWith("small")
            ? "220px"
            : alt.endsWith("medium")
            ? "480px"
            : ["100%", "85%", "70%"]
        }
      />
      {caption && (
        <Text
          as="figcaption"
          fontSize="sm"
          color={captionColor}
          mt={2}
          textAlign="center"
          fontStyle="italic"
          lineHeight="1.4"
        >
          {caption}
        </Text>
      )}
    </Flex>
  );
};

const A = (props: any) => (
  <Link
    href={props.href}
    textColor={useColorModeValue("blue.600", "blue.300")}
    textDecoration="underline"
    textDecorationColor={useColorModeValue("blue.200", "blue.700")}
    textUnderlineOffset="3px"
    _hover={{
      textDecorationColor: useColorModeValue("blue.500", "blue.300"),
    }}
  >
    {props.children}
  </Link>
);

const UL = (props: any) => (
  <UnorderedList my={4} spacing={1} fontSize="md" lineHeight="1.7" pl={2}>
    {props.children}
  </UnorderedList>
);

const OL = (props: any) => (
  <OrderedList my={4} spacing={1} fontSize="md" lineHeight="1.7" pl={2}>
    {props.children}
  </OrderedList>
);

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  img: ResponsiveImage,
  ul: UL,
  ol: OL,
  li: ListItem,
  a: A,
  blockquote: Blockquote,
  code: Code,
  pre: Pre,
  hr: Hr,
};

const BlogLayout = ({ children, ...props }: { children: any }) => {
  return (
    <Flex
      id="Blog"
      mt={8}
      mb="120px"
      direction="column"
      maxW="780px"
      w="100%"
      mx="auto"
      flexGrow={1}
      {...props}
    >
      {!!children.props?.meta?.date && (
        <Text fontSize="xs" color="grey.500" fontFamily="monospace" mb={2}>
          {children.props.meta.date}
        </Text>
      )}
      <MDXProvider components={components} disableParentContext={true}>
        {children}
      </MDXProvider>
    </Flex>
  );
};

const BL = chakra(BlogLayout);
export const getLayout = () => (page: any) => getSiteLayout(<BL>{page}</BL>);

export default BlogLayout;
