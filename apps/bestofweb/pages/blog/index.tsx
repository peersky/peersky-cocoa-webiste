import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { Flex, Spacer, Text, Tag } from "@chakra-ui/react";
import RouteButton from "@peersky/next-web3-chakra/components/RouteButton";
import { useContext } from "react";
import UIContext from "@peersky/next-web3-chakra/providers/UIProvider/context";

const Blog = (props: any) => {
  const ui = useContext(UIContext);
  console.dir(props.posts);
  return (
    <Flex w="100%" py={8}>

      {props.posts.map((post: any) => {
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
          >
            <Text>{post?.title}</Text>
            <Spacer />
            <Text>{post.date} </Text>
            <Spacer />
            {post?.tags?.map((tagName: string) => (
              <Tag variant={"solid"} colorScheme={"blue"} key={tagName}>
                {tagName}
              </Tag>
            ))}
            <RouteButton variant="outline" href={`blog/${post.path}`}>
              Open
            </RouteButton>
          </Flex>
        );
      })}
    </Flex>
  );
};

export async function getStaticProps() {
  const blogPosts = await require("../../content/");
  const postsArray = Object.values(blogPosts).map((post: any) => post.meta);
  return { props: { posts: postsArray } };
}

Blog.getLayout = getLayout();
export default Blog;
