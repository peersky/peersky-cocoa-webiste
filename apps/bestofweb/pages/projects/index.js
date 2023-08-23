import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/BlogLayout";
import { lazy, Suspense } from "react";

const Post = () => {
  const Component = lazy(() => import(`../../content/projects.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};
export async function getStaticProps() {
  const metaTags = {
    title: "My projects",
    description: "Projects im working on",
    keywords: "projects",
    url: `https://peersky.xyz/projects`,
  };
  return {
    props: {
      metaTags: { ...metaTags },
    },
  };
}
Post.getLayout = getLayout();
export default Post;
