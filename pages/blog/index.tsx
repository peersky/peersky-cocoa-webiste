import { getLayout as getBlogLayout } from "../../layouts/BlogLayout";
import {
  Flex,
  Spacer,
  Text,
  Tag,
  Heading,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import RouteButton from "../../components/RouteButton";
import React from "react";
import useAppRouter from "../../hooks/useRouter";

const Blog = (props: any) => {
  const appRouter = useAppRouter();
  const [isMobileView] = useMediaQuery("(max-width: 768px)");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  React.useEffect(() => {
    setSelectedTags(appRouter.query?.tags?.split("&"));
  }, [appRouter.query?.tags]);
  const [displayPosts, setDisplayPosts] = React.useState(props.posts);
  React.useEffect(() => {
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

  return (
    <Flex w="100%" py={8} direction="column" gap={4}>
      <Flex py={2} flexWrap="wrap" gap={2}>
        {allTags.map((tagName: string) => (
          <Tag
            as={Button}
            variant={selectedTags?.includes(tagName) ? "solid" : "outline"}
            colorScheme={selectedTags?.includes(tagName) ? "teal" : "gray"}
            key={tagName}
            size="sm"
            onClick={() => {
              if (selectedTags?.includes(tagName)) {
                const newTags = [...selectedTags].filter(
                  (_tag) => _tag !== tagName
                );
                appRouter.appendQuery("tags", newTags.join("&"), false, false);
              } else {
                let _q = "";
                if (selectedTags?.length > 0 && selectedTags[0] !== "") {
                  _q += selectedTags;
                  _q += "&";
                }
                _q += tagName;
                appRouter.appendQuery("tags", _q, false, false);
              }
            }}
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
        .map((post: any) => (
          <Flex
            key={post.title}
            direction="column"
            w="100%"
            borderWidth="1px"
            borderRadius="lg"
            borderColor="gray.200"
            px={5}
            py={4}
            gap={2}
            _hover={{ borderColor: "gray.400", shadow: "sm" }}
            transition="all 0.15s ease"
          >
            <Flex alignItems="flex-start" justifyContent="space-between" gap={4}>
              <Heading size="md" lineHeight="1.3">
                {post?.title}
              </Heading>
              <RouteButton
                variant="ghost"
                href={`blog/${post.path}`}
                size="sm"
                flexShrink={0}
              >
                Read →
              </RouteButton>
            </Flex>
            {post?.description && (
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {post.description}
              </Text>
            )}
            <Flex alignItems="center" gap={2} flexWrap="wrap">
              {post?.tags?.map((tagName: string) => (
                <Tag variant="subtle" colorScheme="blue" size="sm" key={tagName}>
                  {tagName}
                </Tag>
              ))}
              <Spacer />
              <Text fontSize="xs" color="gray.400">
                {post.date}
              </Text>
            </Flex>
          </Flex>
        ))}
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

Blog.getLayout = getBlogLayout();
export default Blog;
