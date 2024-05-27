import { lazy, Suspense } from "react";
import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/BlogLayout";
const Post = (props: any) => {
  const Component = lazy(() => import(`../../content/dao-spawn.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};
Post.getLayout = getLayout();
export default Post;
