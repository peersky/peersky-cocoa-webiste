import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/BlogLayout";
import { lazy, Suspense } from "react";

const Post = () => {
  const Component = lazy(() => import(`../../content/about.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};
export async function getStaticProps() {
  const metaTags = {
    title: "About @Peersky",
    description: "Who is @peersky",
    keywords: "about me",
    url: `https://peersky.xyz/about`,
  };
  return {
    props: {
      metaTags: { ...metaTags },
    },
  };
}
Post.getLayout = getLayout();
export default Post;
