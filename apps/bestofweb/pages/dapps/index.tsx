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
        <Text>Multipass</Text>
        <Spacer />
        <Text>- simple blockchain id</Text>
        <Spacer />
        <RouteButton variant="outline" href={`dapps/multipass`}>
          go!
        </RouteButton>
        <RouteButton
          variant="outline"
          href={`https://github.com/peersky/repositories/daococoa/multipass.md`}
        >
          wtf?
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
        <Text>Best of web</Text>
        <Spacer />
        <Text>- Playful process of delegated voting</Text>
        <Spacer />
        <RouteButton variant="outline" href={`dapps/bestofweb`}>
          go!
        </RouteButton>
        <RouteButton
          variant="outline"
          href={`https://github.com/peersky/repositories/daococoa/bestofweb.md`}
        >
          wtf?
        </RouteButton>
      </Flex>
    </Flex>
  );
};

Projects.getLayout = getLayout();
export default Projects;
