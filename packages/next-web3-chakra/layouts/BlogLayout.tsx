// import React from "react";
import { getLayout as getSiteLayout } from "./AppLayout";
import {
  Flex,
  chakra,
  Heading,
  Text,
  Image,
  List,
  ListItem,
  OrderedList,
  Link,
  Center,
  Tag,
  Spacer,
} from "@chakra-ui/react";
import { MDXProvider } from "@mdx-js/react";

// import {MDXCom}

const H1 = (props: any) => (
  <Heading as="h1" size="xl" borderBottomWidth={"3px"} my={8}>
    {props.children}
  </Heading>
);
const H2 = (props: any) => (
  <Heading as="h2" size="lg" borderBottomWidth={"2px"} my={6}>
    {props.children}
  </Heading>
);
const H3 = (props: any) => (
  <Heading as="h3" size="md" my={4}>
    {props.children}
  </Heading>
);
const P = (props: any) => <chakra.span py={2}>{props.children}</chakra.span>;
const ResponsiveImage = (props: any) => (
  <Center>
    <Image
      mt={4}
      mb={1}
      alt={props.alt}
      {...props}
      w={
        props.alt.endsWith("fullwidth")
          ? "100%"
          : ["100%", "75%", "50", null, "50%"]
      }
    />
  </Center>
);

const A = (props: any) => (
  <Link
    href={props.href}
    // textColor={useColorModeValue("blue.400", "blue.200")}
  >
    {props.children}
  </Link>
);

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  img: ResponsiveImage,
  ul: List,
  ol: OrderedList,
  li: ListItem,
  a: A,
};

const BlogLayout = ({
  children,
  tags,
  date,
  ...props
}: {
  tags?: string[];
  date?: string;
  children: any;
}) => {
  return (
    <Flex
      id="Blog"
      px={["0px", "0%", "20%"]}
      my={8}
      direction="column"
      maxW={"2048px"}
      flexBasis="200px"
      flexGrow={1}
    >
      <Flex direction={"row"} flexWrap="wrap">
        {tags &&
          tags.map((tag) => (
            <Tag colorScheme={"blue"} variant={"outline"} key={`${tag}`}>
              {tag}
            </Tag>
          ))}
        <Spacer />
        {date && date}
      </Flex>
      <MDXProvider components={components} disableParentContext={true}>
        {children}
      </MDXProvider>
    </Flex>
  );
};

const BL = chakra(BlogLayout);
export const getLayout = (date?: string, tags?: string[]) => (page: any) =>
  getSiteLayout(
    <BL date={date} tags={tags}>
      {page}
    </BL>
  );

export default BlogLayout;
