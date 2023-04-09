import { Flex, Heading, Button, chakra, Stack } from "@chakra-ui/react";
import useBestOfWebContract from "../../hooks/useBestOfWebContract";
import { UseQueryResult, UseQueryOptions } from "react-query";
import { useContext } from "react";
import Web3Context from "../../providers/Web3Provider/context";
import JoinRequirements from "../JoinRequirements";

const _JoinGame = ({
  gameId,
  onSuccess,
}: {
  gameId: string;
  onSuccess?: UseQueryOptions["onSuccess"];
}) => {
  const web3ctx = useContext(Web3Context);
  const bestContract = useBestOfWebContract({ web3ctx: web3ctx });

  return (
    <Flex direction="column" justifyItems={"center"}>
      <Heading>Join game</Heading>
      <JoinRequirements gameId={gameId} />
      <Stack
        direction={["column", "row", null, "row"]}
        justifyContent="center"
        alignItems={"center"}
      >
        <Button
          colorScheme={"green"}
          onClick={() => {
            bestContract.approveAll.mutate(gameId, {});
          }}
        >
          Approve all
        </Button>
        <Button
          onClick={() => {
            bestContract.joinGame.mutate(gameId, {
              onSuccess: onSuccess,
            });
          }}
        >
          Join
        </Button>
      </Stack>
    </Flex>
  );
};

const JoinGame = chakra(_JoinGame);

export default JoinGame;
