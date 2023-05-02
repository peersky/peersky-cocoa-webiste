import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { Flex, Spacer, Text, Heading } from "@chakra-ui/react";
import RouteButton from "@peersky/next-web3-chakra/components/RouteButton";
import { useContext } from "react";
import UIContext from "@peersky/next-web3-chakra/providers/UIProvider/context";

const Projects = () => {
  const ui = useContext(UIContext);
  return (
    <Flex w="100%" py={8} direction="column">
      <Heading mb={12} size="xl">
        {`Temple of "Work In Progress"`}
      </Heading>
      <Flex
        dir={ui.isMobileView ? "column" : "row"}
        w="100%"
        borderWidth="2px"
        borderRadius={"md"}
        borderColor="ActiveCaption"
        alignItems={"center"}
        px={2}
        py={2}
        flexWrap="wrap"
      >
        <Text>Multipass Protocol</Text>
        <Spacer />
        <Text>- simple blockchain id</Text>
        <Spacer />
        <RouteButton variant="outline" href={`dapps/multipass`}>
          Learn more
        </RouteButton>
        {/* <RouteButton variant="outline" href={`/dapps/multipass/WTF`}>
          wtf?
        </RouteButton> */}
      </Flex>
      <Flex
        dir={ui.isMobileView ? "column" : "row"}
        w="100%"
        borderWidth="2px"
        borderRadius={"md"}
        borderColor="ActiveCaption"
        alignItems={"center"}
        px={2}
        py={2}
        flexWrap="nowrap"
        mt={4}
      >
        <Text display={"inline-block"} minW="180px">
          Game master Protocol
        </Text>
        <Spacer />
        <Text>
          Verifiable way of submitting non-zk yet anonymous votes and proposals
          trough a trusted third party relay
        </Text>
        <Spacer />
        {/* <RouteButton
          variant="outline"
          href={`dapps/bestofweb`}
          isDisabled={true}
        >
          go!
        </RouteButton> */}
        <RouteButton variant="outline" href={`dapps/gm/wtf`}>
          Learn more
        </RouteButton>
      </Flex>
    </Flex>
  );
};

export async function getStaticProps() {
  const metaTags = {
    title: "dApps",
    description: "Work in progress stuff",
    url: `https://peersky.xyz/dapps`,
  };
  return { props: { metaTags } };
}

Projects.getLayout = getLayout();
export default Projects;
