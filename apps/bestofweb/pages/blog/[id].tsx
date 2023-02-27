import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { lazy, Suspense } from "react";

export async function getStaticPaths() {
  const blogPosts = await require("../../content/");
  const postsArray = Object.values(blogPosts).map((post) => post);
  return {
    paths: postsArray.map((post: any) => {
      return {
        params: {
          id: post.meta.path,
          meta: { ...post.meta },
          Children: post.default,
        },
      };
    }),
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps({ params }: { params: any }) {
  return {
    props: {
      ...params,
    },
  };
}
var meta: any;
const Post = (props: any) => {
  meta = { ...props.meta };
  const Component = lazy(() => import(`../../content/${props.id}.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};

Post.getLayout = getLayout(meta?.date ?? "", meta?.tags ?? "");
export default Post;
