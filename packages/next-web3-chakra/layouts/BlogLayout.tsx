// import React from "react";
import { getLayout as getSiteLayout } from "./AppLayout";
import {
  Flex,
  chakra,
  Heading,
  Text,
  Image,
  UnorderedList,
  ListItem,
  OrderedList,
  Link,
  Center,
  Tag,
  useColorModeValue,
  Spacer,
} from "@chakra-ui/react";
import { MDXProvider } from "@mdx-js/react";

// import {MDXCom}

const H1 = (props: any) => (
  <Heading as="h1" size="2xl" borderBottomWidth={"3px"} my={8}>
    {props.children}
  </Heading>
);
const H2 = (props: any) => (
  <Heading as="h2" size="xl" borderBottomWidth={"2px"} my={6}>
    {props.children}
  </Heading>
);
const H3 = (props: any) => (
  <Heading as="h3" size="lg" my={4}>
    {props.children}
  </Heading>
);

const H4 = (props: any) => (
  <Heading as="h4" size="md" my={2} fontWeight="bold">
    {props.children}
  </Heading>
);
const P = (props: any) => <chakra.span py={2}>{props.children}</chakra.span>;
const ResponsiveImage = (props: any) => {
  const docsImportPath = "../apps/bestofweb/public";
  const imgSrc = !props.src.startsWith(docsImportPath)
    ? props.src
    : props.src.slice(docsImportPath.length);
  console.log(props.src, imgSrc, props.src.startsWith(docsImportPath));

  return (
    <Center>
      <Image
        mt={4}
        mb={1}
        // {...props}
        alt={props.alt}
        src={imgSrc}
        w={
          props.alt.endsWith("fullwidth")
            ? "100%"
            : props.alt.endsWith("small")
            ? "220px"
            : props.alt.endsWith("medium")
            ? "480px"
            : ["100%", "75%", "50", null, "50%"]
        }
      />
    </Center>
  );
};

const A = (props: any) => (
  <Link href={props.href} textColor={useColorModeValue("blue.600", "blue.300")}>
    {props.children}
  </Link>
);

const UL = (props: any) => (
  <UnorderedList my={4}>{props.children}</UnorderedList>
);

const OL = (props: any) => <OrderedList my={4}>{props.children}</OrderedList>;

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
};

const BlogLayout = ({ children, ...props }: { children: any }) => {
  console.log("children", children.props.meta);
  return (
    <Flex
      id="Blog"
      px={["0px", "0%", "20%"]}
      mt={8}
      mb="220px"
      direction="column"
      maxW={"2048px"}
      flexBasis="200px"
      flexGrow={1}
      {...props}
    >
      <Flex direction={"row"} flexWrap="wrap">
        {/* {tags &&
          tags.map((tag) => (
            <Tag colorScheme={"blue"} variant={"outline"} key={`${tag}`}>
              {tag}
            </Tag>
          ))} */}
        <Spacer />
        {!!children.props?.meta?.date && children.props?.meta?.date}
      </Flex>
      <MDXProvider components={components} disableParentContext={true}>
        {children}
      </MDXProvider>
    </Flex>
  );
};

const BL = chakra(BlogLayout);
export const getLayout = () => (page: any) => getSiteLayout(<BL>{page}</BL>);

export default BlogLayout;
