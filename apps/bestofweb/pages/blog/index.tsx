import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { Flex, Spacer, Text } from "@chakra-ui/react";
import RouteButton from "@peersky/next-web3-chakra/components/RouteButton";
// import Content from "../../content/test.mdx";

const Blog = () => {
  return (
    <Flex w="100%">
      {/* <ListItem w="100%"> */}
      <Flex
        dir="column"
        w="100%"
        borderWidth="2px"
        borderRadius={"md"}
        borderColor="ActiveCaption"
        alignItems={"center"}
        px={2}
      >
        <Text>Open Economy - Intro to money</Text>
        <Spacer />
        <Text>24 Feb 2023 </Text>
        <Spacer />{" "}
        <RouteButton variant="outline" href="/blog/OpenEconomy">
          Open
        </RouteButton>
      </Flex>
      {/* </ListItem> */}
    </Flex>
  );
};
Blog.getLayout = getLayout;
export default Blog;
