import { getLayout as getBlogLayout } from "../../layouts/BlogLayout";
import { lazy, Suspense, useState } from "react";
import { HStack, Button, Link } from "@chakra-ui/react";
import { DownloadIcon, CopyIcon, CheckIcon } from "@chakra-ui/icons";

const Post = () => {
  const Component = lazy(() => import(`../../content/resume.mdx`));
  const [copied, setCopied] = useState(false);

  const copyMarkdown = async () => {
    const md = await fetch("/resume.md").then((r) => r.text());
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          size="sm"
          variant="outline"
          leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={copyMarkdown}
        >
          {copied ? "Copied" : "Copy Markdown"}
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
