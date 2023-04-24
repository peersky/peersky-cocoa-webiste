import { Flex, Heading, Button, chakra } from "@chakra-ui/react";
import useBestOfWebContract from "../../hooks/useBestOfWebContract";
import { UseQueryResult, UseQueryOptions } from "react-query";
import { useContext } from "react";
import Web3Context from "../../providers/Web3Provider/context";
import JoinRequirements from "../JoinRequirements";
import NewRequirement from "../NewRequirement";

const _SetReqs = ({
  gameId,
  onSuccess,
}: {
  gameId: string;
  onSuccess?: UseQueryOptions["onSuccess"];
}) => {
  const web3ctx = useContext(Web3Context);
  const bestContract = useBestOfWebContract({ web3ctx: web3ctx });

  return (
    <Flex direction="column">
      <Heading>Set joining requirements for your game</Heading>
      <NewRequirement
        onSubmit={(e) => {
          console.log("submitted!", e);
          bestContract.setJoinRequirements.mutate({
            gameId: gameId,
            config: e.request,
          });
        }}
      />
    </Flex>
  );
};

export const SetReqs = chakra(_SetReqs);
