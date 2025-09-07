import { getBlogLayout } from "@peersky/next-web3-chakra";
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
Post.getLayout = getBlogLayout();
export default Post;
