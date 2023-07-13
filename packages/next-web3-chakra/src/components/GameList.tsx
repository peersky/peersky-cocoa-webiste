import { Flex, Text, Heading } from "@chakra-ui/react";
import { NWCListITem } from "./NWCListItem";

export const ListView = ({
  title,
  items,
  ...props
}: {
  title: string;
  items: { title: string; description: string; wtf?: string; go: string }[];
}) => {
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
