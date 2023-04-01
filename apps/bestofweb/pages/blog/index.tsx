import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { Flex, Spacer, Text, Tag, Heading } from "@chakra-ui/react";
import RouteButton from "@peersky/next-web3-chakra/components/RouteButton";
import { useContext } from "react";
import UIContext from "@peersky/next-web3-chakra/providers/UIProvider/context";

const Blog = (props: any) => {
  const ui = useContext(UIContext);
  return (
    <Flex w="100%" py={8} direction="column">
      {props.posts
        .sort((a: any, b: any) => {
          const da: any = new Date(a.date);
          const db: any = new Date(b.date);
          return db - da;
        })
        .map((post: any) => {
          console.log(post.description);
          return (
            <Flex
              key={post.title}
              dir={ui.isMobileView ? "column" : "row"}
              w="100%"
              borderWidth="2px"
              borderRadius={"md"}
              borderColor="ActiveCaption"
              alignItems={"center"}
              px={2}
              py={2}
              flexWrap="wrap"
              mb={2}
            >
              <Flex
                w="100%"
                alignItems={"center"}
                borderBottomWidth="2px"
                borderBottomColor={"gray.500"}
              >
                <Heading w={ui.isMobileView ? "100%" : "50%"}>
                  {post?.title}
                </Heading>
                <Spacer />
                {/* <Spacer /> */}
                <Text w={ui.isMobileView ? "100%" : "15%"}>{post.date} </Text>
                <Spacer />
                <Flex w={ui.isMobileView ? "100%" : "15%"} wrap="wrap">
                  {post?.tags?.map((tagName: string) => (
                    <Tag
                      variant={"solid"}
                      colorScheme={"blue"}
                      key={tagName}
                      h="24px"
                    >
                      {tagName}
                    </Tag>
                  ))}
                </Flex>
                <RouteButton
                  variant="outline"
                  href={`blog/${post.path}`}
                  h="24px"
                  w={ui.isMobileView ? "50%" : "15%"}
                >
                  Open
                </RouteButton>
              </Flex>
              <Text fontSize={"sm"}>{post?.description}</Text>
            </Flex>
          );
        })}
    </Flex>
  );
};

export async function getStaticProps() {
  const blogPosts = await require("../../content/");
  console.log(blogPosts);
  const postsArray = Object.values(blogPosts).map((post: any) => post.meta);
  return { props: { posts: postsArray } };
}

Blog.getLayout = getLayout();
export default Blog;
