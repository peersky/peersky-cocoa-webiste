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
        <Text>SoliHash</Text>
        <Spacer />
        <Text>Online solidity hash calclator</Text>
        <Spacer />
        <RouteButton variant="outline" href={`tools/solihash`}>
          go!
        </RouteButton>
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
        flexWrap="wrap"
        mt={4}
      >
        <Text>Contracts interface</Text>
        <Spacer />
        <Text>Programmatic way of generating contract UI</Text>
        <Spacer />
        <RouteButton variant="outline" href={`tools/contracts`}>
          go!
        </RouteButton>
      </Flex>
    </Flex>
  );
};

Projects.getLayout = getLayout();
export default Projects;
