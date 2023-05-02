import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { lazy, Suspense } from "react";

const Post = () => {
  const Component = lazy(() => import(`../../../../../docs/gm.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};

export async function getStaticProps() {
  const blogPosts = await require("../../content/");
  console.log(blogPosts);
  const postsArray = Object.values(blogPosts).map((post: any) => post.meta);
  const metaTags = {
    title: "Game Master protocol",
    description:
      "Protocol of providing secure decentralized escrow for turn based blockchain actions that needs to be batched",
    keywords:
      "blog, peersky, peersky.eth, ideas, blockchain, technology, philosophy",
    url: `https://peersky.xyz/dapps/gm/wtf`,
  };
  return { props: { posts: postsArray, metaTags } };
}

Post.getLayout = getLayout();
export default Post;
