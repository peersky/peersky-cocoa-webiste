import { getLayout as getBlogLayout } from "../../layouts/BlogLayout";
import { lazy, Suspense } from "react";
import { HStack, Button, Link } from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";

const Post = () => {
  const Component = lazy(() => import(`../../content/resume.mdx`));

  return (
    <>
      <HStack
        spacing={3}
        mt={6}
        justify="flex-end"
        sx={{ "@media print": { display: "none" } }}
      >
        <Button
          as={Link}
          href="/resume.pdf"
          download="Tim-Pecerskis-Resume.pdf"
          size="sm"
          variant="outline"
          leftIcon={<DownloadIcon />}
          _hover={{ textDecoration: "none" }}
        >
          Download PDF
        </Button>
        <Button
          as={Link}
          href="/resume.md"
          isExternal
          size="sm"
          variant="outline"
          leftIcon={<ExternalLinkIcon />}
          _hover={{ textDecoration: "none" }}
        >
          Markdown
        </Button>
      </HStack>
      <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>
    </>
  );
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
