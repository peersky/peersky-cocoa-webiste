import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { Flex, Spacer, Text, Heading } from "@chakra-ui/react";
import RouteButton from "@peersky/next-web3-chakra/components/RouteButton";
import { useContext } from "react";
import UIContext from "@peersky/next-web3-chakra/providers/UIProvider/context";
import NWCListITem from "./NWCListItem";

const ListView = ({
  title,
  items,
  ...props
}: {
  title: string;
  items: { title: string; description: string; wtf?: string; go: string }[];
}) => {
  const ui = useContext(UIContext);
  return (
    <Flex w="100%" py={8} direction="column">
      <Heading mb={12} size="xl">
        {title}
      </Heading>

      {items.map((item) => (
        <NWCListITem {...item} />
      ))}
    </Flex>
  );
};

export default ListView;
