import { lazy, Suspense } from "react";
import { getLayout as getBlogLayout } from "../../layouts/BlogLayout";
const Post = (props: any) => {
  const Component = lazy(() => import(`../../content/dao-spawn.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};
Post.getLayout = getBlogLayout();
export default Post;
