import React, { useContext } from "react";
import { Flex, Text, Spacer, chakra } from "@chakra-ui/react";
import { RouteButton } from "./RouteButton";
import { UIContext } from "../providers/UIProvider/context";

const _NWCListItem = (item: {
  title: string;
  description: string;
  wtf?: string;
  go: string;
}) => {
  const ui = useContext(UIContext);
  return (
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
      <Text>{item.title}</Text>
      <Spacer />
      <Text> {item.description}</Text>
      <Spacer />
      <RouteButton variant="outline" href={item.go}>
        go!
      </RouteButton>
      {item.wtf && (
        <RouteButton variant="outline" href={item.wtf}>
          wtf?
        </RouteButton>
      )}
    </Flex>
  );
};

export const NWCListITem = chakra(_NWCListItem);
