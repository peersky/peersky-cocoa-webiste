import Content from "../../content/test.mdx";
import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
const Post = () => <Content />;

Post.getLayout = getLayout;
export default Post;
