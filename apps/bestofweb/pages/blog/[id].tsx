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
          Children: post.default,
        },
      };
    }),
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps({ params }: { params: any }) {
  const blogPosts = await require("../../content/");
  const postsArray = Object.values(blogPosts).map((post) => post);
  const post: any = postsArray.find(
    (_post: any) => _post.meta.path === params.id
  );
  const metaTags = {
    title: post.meta.title,
    description: post.meta.description,
    keywords: post.meta.tags.toLocaleString(),
    url: `peersky.xyz/bog/${post.meta.path}}`,
  };
  return {
    props: {
      ...params,
      meta: { ...post.meta },
      metaTags: { ...metaTags },
    },
  };
}
var meta: any;
const Post = (props: any) => {
  const Component = lazy(() => import(`../../content/${props.id}.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};

Post.getLayout = getLayout(meta?.date ?? "", meta?.tags ?? "");
export default Post;
