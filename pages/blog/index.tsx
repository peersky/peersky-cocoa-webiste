import { getLayout as getBlogLayout } from "../../layouts/BlogLayout";
import {
  Box,
  Flex,
  Spacer,
  Text,
  Tag,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import useAppRouter from "../../hooks/useRouter";

const Blog = (props: any) => {
  const appRouter = useAppRouter();
  const cardBg = useColorModeValue("grey.0", "grey.800");
  const borderColor = useColorModeValue("grey.100", "grey.700");
  const hoverBorderColor = useColorModeValue("blue.300", "blue.400");
  const titleColor = useColorModeValue("grey.800", "grey.0");
  const descColor = useColorModeValue("grey.600", "grey.300");
  const dateColor = useColorModeValue("grey.500", "grey.400");
  const headerColor = useColorModeValue("grey.500", "grey.400");
  const dividerColor = useColorModeValue("grey.200", "grey.700");
  const accentText = useColorModeValue("blue.600", "blue.300");
  const inactiveBg = useColorModeValue("transparent", "transparent");
  const inactiveFg = useColorModeValue("grey.700", "grey.200");
  const inactiveBorder = useColorModeValue("grey.200", "grey.600");
  const hoverBg = useColorModeValue("grey.50", "grey.700");
  const hoverBorder = useColorModeValue("grey.400", "grey.400");
  const activeBg = useColorModeValue("blue.500", "blue.400");
  const activeFg = useColorModeValue("grey.0", "grey.900");
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

  const activeSet = React.useMemo(() => {
    const set = new Set<string>();
    (selectedTags || []).forEach((t) => {
      if (t) set.add(t);
    });
    return set;
  }, [selectedTags]);

  const hasSelection = activeSet.size > 0;

  const writeTagQuery = React.useCallback(
    (tags: string[]) => {
      appRouter.appendQuery("tags", tags.join("&"), false, false);
    },
    [appRouter]
  );

  const toggleTag = React.useCallback(
    (tagName: string) => {
      const next = new Set(activeSet);
      if (next.has(tagName)) {
        next.delete(tagName);
      } else {
        next.add(tagName);
      }
      writeTagQuery(Array.from(next));
    },
    [activeSet, writeTagQuery]
  );

  const clearAll = React.useCallback(() => {
    writeTagQuery([]);
  }, [writeTagQuery]);

  return (
    <Flex w="100%" maxW="820px" mx="auto" py={10} px={4} direction="column" gap={6}>
      <Box>
        <Heading
          as="h1"
          fontSize={["3xl", "4xl", "5xl"]}
          letterSpacing="-0.03em"
          lineHeight="1.05"
          mb={2}
        >
          Writing
        </Heading>
        <Text color={descColor} fontSize="md" maxW="640px">
          Notes, essays and longer-form pieces on protocols, hardware, governance and the
          quieter side of building.
        </Text>
      </Box>

      <Box borderTopWidth="1px" borderColor={dividerColor} pt={4}>
        <Flex alignItems="center" gap={3} mb={3} flexWrap="wrap">
          <Text
            fontSize="xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.1em"
            color={headerColor}
          >
            Filter by topic
          </Text>
          {hasSelection && (
            <Text
              as="button"
              fontSize="xs"
              color={accentText}
              textDecoration="underline"
              textUnderlineOffset="3px"
              _hover={{ opacity: 0.7 }}
              onClick={clearAll}
            >
              clear all
            </Text>
          )}
        </Flex>
        <Flex flexWrap="wrap" gap={2}>
          {allTags.map((tagName: string) => {
            const active = activeSet.has(tagName);
            return (
              <Tag
                key={tagName}
                size="md"
                borderRadius="full"
                px={3}
                py={1}
                cursor="pointer"
                userSelect="none"
                fontWeight="500"
                bg={active ? activeBg : inactiveBg}
                color={active ? activeFg : inactiveFg}
                borderWidth="1px"
                borderColor={active ? activeBg : inactiveBorder}
                _hover={{
                  borderColor: active ? activeBg : hoverBorder,
                  bg: active ? activeBg : hoverBg,
                }}
                transition="all 0.15s ease"
                onClick={() => toggleTag(tagName)}
              >
                {tagName}
              </Tag>
            );
          })}
        </Flex>
      </Box>

      <Flex direction="column" gap={4} mt={2}>
        {displayPosts
          .sort((a: any, b: any) => {
            const da: any = new Date(a.date);
            const db: any = new Date(b.date);
            return db - da;
          })
          .map((post: any) => (
            <Box
              as="a"
              href={`/blog/${post.path}`}
              key={post.title}
              w="100%"
              borderWidth="1px"
              borderRadius="10px"
              borderColor={borderColor}
              bg={cardBg}
              px={6}
              py={5}
              cursor="pointer"
              role="group"
              transition="all 0.2s ease"
              _hover={{
                borderColor: hoverBorderColor,
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px -12px rgba(122, 110, 88, 0.18)",
              }}
            >
              <Flex alignItems="center" gap={3} mb={2}>
                <Text
                  fontSize="xs"
                  color={dateColor}
                  fontFamily="mono"
                  letterSpacing="0.05em"
                >
                  {post.date}
                </Text>
                {post?.tags?.slice(0, 3).map((tagName: string) => (
                  <Tag
                    variant="subtle"
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                    key={tagName}
                  >
                    {tagName}
                  </Tag>
                ))}
                <Spacer />
                <Text
                  fontSize="sm"
                  color={dateColor}
                  _groupHover={{ color: hoverBorderColor, transform: "translateX(2px)" }}
                  transition="all 0.2s ease"
                >
                  →
                </Text>
              </Flex>
              <Heading
                as="h2"
                size="md"
                lineHeight="1.3"
                letterSpacing="-0.01em"
                color={titleColor}
// TODO(slop): add test for new `ternary` branch (no paired test file in this patch)
                mb={post?.description ? 2 : 0}
              >
                {post?.title}
              </Heading>
              {post?.description && (
                <Text fontSize="sm" color={descColor} lineHeight="1.6" noOfLines={2}>
                  {post.description}
                </Text>
              )}
            </Box>
          ))}
      </Flex>
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
