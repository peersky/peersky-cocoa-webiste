import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { lazy, Suspense } from "react";

const Post = (props: any) => {
  const Component = lazy(() => import(`../../../../../docs/multipass.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};

Post.getLayout = getLayout();
export default Post;
