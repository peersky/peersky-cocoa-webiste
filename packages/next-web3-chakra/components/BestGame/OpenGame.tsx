import { Flex, Heading, Button, chakra } from "@chakra-ui/react";
import useBestOfWebContract from "../../hooks/useBestOfWebContract";
import { UseQueryResult, UseQueryOptions } from "react-query";
import { useContext } from "react";
import Web3Context from "../../providers/Web3Provider/context";

const _OpenGame = ({
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
      <Heading>Open game registration</Heading>
      <Button
        onClick={() => {
          bestContract.openRegistration.mutate(gameId, {
            onSuccess: onSuccess,
          });
        }}
      >
        Submit
      </Button>
    </Flex>
  );
};

export const OpenGame = chakra(_OpenGame);
