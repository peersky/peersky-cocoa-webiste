import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/BlogLayout";
import { Flex, Spacer, Text, Tag, Heading, Button } from "@chakra-ui/react";
import RouteButton from "@peersky/next-web3-chakra/dist/components/RouteButton";
import React, { useContext } from "react";
import UIContext from "@peersky/next-web3-chakra/dist/providers/UIProvider/context";
import useAppRouter from "@peersky/next-web3-chakra/dist/hooks/useRouter";

const Blog = (props: any) => {
  const ui = useContext(UIContext);
  const appRouter = useAppRouter();
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  React.useEffect(() => {
    setSelectedTags(appRouter.query?.tags?.split("&"));
  }, [appRouter.query?.tags]);
  console.log("selectedTags", selectedTags);
  const [displayPosts, setDisplayPosts] = React.useState(props.posts);
  React.useEffect(() => {
    console.log("show all posts", selectedTags);
    if (!selectedTags || (selectedTags.length == 1 && selectedTags[0] == "")) {
      setDisplayPosts(props.posts);
    } else {
      setDisplayPosts(
        props.posts.filter((_post: any) => {
          let found = true;
          selectedTags.forEach((_stag: any) => {
            if (!_post.tags.includes(_stag)) {
              found = false;
            }
          });
          return found;
        })
      );
    }
  }, [selectedTags, props.posts]);

  const [allTags] = React.useState<string[]>(() => {
    let tags: string[] = [];
    props.posts.forEach((post: any) => {
      post.tags.forEach((tag: string) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    });
    return tags;
  });
  React.useEffect(() => {}, [props.posts, allTags]);
  console.log(allTags);
  return (
    <Flex w="100%" py={8} direction="column">
      <Flex py={2} flexWrap="wrap">
        {allTags.map((tagName: string) => (
          <Tag
            as={Button}
            variant={"solid"}
            colorScheme={selectedTags?.includes(tagName) ? "green" : "blue"}
            key={tagName}
            onClick={() => {
              if (selectedTags?.includes(tagName)) {
                const newTags = [...selectedTags].filter(
                  (_tag) => _tag !== tagName
                );
                appRouter.appendQuery("tags", newTags.join("&"), false, false);

                // const router
              } else {
                // setSelectedTags((prevTags: any) => [tagName, ...prevTags]);
                let _q = "";
                if (selectedTags?.length > 0 && selectedTags[0] !== "") {
                  console.log("selectedTags.length", selectedTags.length);
                  _q += selectedTags;
                  _q += "&";
                }
                _q += tagName;
                appRouter.appendQuery("tags", _q, false, false);
              }
            }}
            h="24px"
          >
            {tagName}
          </Tag>
        ))}
      </Flex>
      {displayPosts
        .sort((a: any, b: any) => {
          const da: any = new Date(a.date);
          const db: any = new Date(b.date);
          return db - da;
        })
        .map((post: any) => {
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
                <Heading w={ui.isMobileView ? "100%" : "100%"}>
                  {post?.title}
                </Heading>

                {/* <Spacer /> */}

                <RouteButton
                  variant="outline"
                  href={`blog/${post.path}`}
                  h="24px"
                  w={ui.isMobileView ? "50%" : "15%"}
                >
                  Open
                </RouteButton>
              </Flex>
              <Flex pt={2} w={ui.isMobileView ? "100%" : "100%"} wrap="wrap">
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
                <Spacer />
                <Text w={ui.isMobileView ? "100%" : "15%"}>{post.date} </Text>
                {/* <Spacer /> */}
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
  const postsArray = Object.values(blogPosts).map((post: any) => post.meta);
  const metaTags = {
    title: "Peersky.eth blog",
    description: "Thoughts and ideas on how to make world a better place",
    keywords:
      "blog, peersky, peersky.eth, ideas, blockchain, technology, philosophy",
    url: `https://peersky.xyz/blog`,
  };
  return { props: { posts: postsArray, metaTags } };
}

Blog.getLayout = getLayout();
export default Blog;
