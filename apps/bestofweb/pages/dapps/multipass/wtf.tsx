import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { lazy, Suspense } from "react";

const Post = (props: any) => {
  const Component = lazy(() => import(`../../../../../docs/multipass.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};

export async function getStaticProps() {
  const metaTags = {
    title: "What is Multipass protocol",
    description:
      "Linking your public blockchain identity to social network domains",
    keywords:
      "blog, peersky, peersky.eth, ideas, blockchain, technology, philosophy",
    url: `https://peersky.xyz/dapps/multipass/wtf`,
  };
  return { props: { metaTags } };
}

Post.getLayout = getLayout();
export default Post;
