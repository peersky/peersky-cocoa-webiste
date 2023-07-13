import { useState } from "react";
import {
  Flex,
  Heading,
  Button,
  chakra,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { useBestOfWebContract } from "../../hooks/useBestOfWebContract";
import { UseQueryResult, UseQueryOptions } from "react-query";
import { useContext } from "react";
import { Web3Context } from "../../providers/Web3Provider/context";
import { JoinRequirements } from "../JoinRequirements";

const _JoinGame = ({
  gameId,
  onSuccess,
}: {
  gameId: string;
  onSuccess?: UseQueryOptions["onSuccess"];
}) => {
  const web3ctx = useContext(Web3Context);
  const bestContract = useBestOfWebContract({ web3ctx: web3ctx });
  const [canJoin, setCanJoin] = useState(true);
  console.log("canJoin", canJoin);

  return (
    <Flex direction="column" justifyItems={"center"}>
      <Heading>Join game</Heading>
      <JoinRequirements
        gameId={gameId}
        onInsufficient={() => setCanJoin(false)}
      />
      <Stack
        direction={["column", "row", null, "row"]}
        justifyContent="center"
        alignItems={"center"}
      >
        <Button
          isLoading={bestContract.approveAll.isLoading}
          colorScheme={"green"}
          onClick={() => {
            bestContract.approveAll.mutate(gameId, {});
          }}
        >
          Approve all
        </Button>
        <Tooltip
          label="You are missing some assets to fulfill requirements"
          isDisabled={canJoin}
        >
          <Button
            isDisabled={!canJoin}
            isLoading={bestContract.joinGame.isLoading}
            onClick={() => {
              bestContract.joinGame.mutate(gameId, {
                onSuccess: !!onSuccess ? (e) => onSuccess(e) : undefined,
              });
            }}
          >
            Join
          </Button>
        </Tooltip>
      </Stack>
    </Flex>
  );
};

export const JoinGame = chakra(_JoinGame);
