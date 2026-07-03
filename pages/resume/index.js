import { getLayout as getBlogLayout } from "../../layouts/BlogLayout";
import { lazy, Suspense } from "react";

const Post = () => {
  const Component = lazy(() => import(`../../content/resume.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};
export async function getStaticProps() {
  const metaTags = {
    title: "Resume — Tim Pečerskis",
    description:
      "Professional experience of Tim Pečerskis (Peersky): 15+ years across AI, blockchain, embedded, RF and microwave R&D.",
    keywords:
      "resume, cv, Tim Pecerskis, Peersky, engineer, blockchain, AI, embedded, microwave, RF",
    url: `https://peersky.xyz/resume`,
  };
  return {
    props: {
      metaTags: { ...metaTags },
    },
  };
}
Post.getLayout = getBlogLayout();
export default Post;
