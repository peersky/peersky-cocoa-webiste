import * as AboutContent from "../../content/about.mdx";
import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { lazy, Suspense } from "react";

const meta = AboutContent.meta;
const Post = () => {
  const Component = lazy(() => import(`../../content/about.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};

Post.getLayout = getLayout(meta?.date ?? "", meta?.tags ?? "");
export default Post;
