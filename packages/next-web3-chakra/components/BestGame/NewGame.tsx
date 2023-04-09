import {
  Flex,
  Heading,
  Button,
  chakra,
  NumberInput,
  FormLabel,
  NumberInputField,
  Tooltip,
} from "@chakra-ui/react";
import useBestOfWebContract from "../../hooks/useBestOfWebContract";
import { UseQueryResult, UseQueryOptions } from "react-query";
import React, { useContext } from "react";
import Web3Context from "../../providers/Web3Provider/context";
import JoinRequirements from "../JoinRequirements";
import NewRequirement from "../NewRequirement";

const _NewGame = ({
  gameId,
  onSuccess,
  setNewGameId,
  gm,
}: {
  gameId: string;
  onSuccess?: UseQueryOptions["onSuccess"];
  setNewGameId: React.Dispatch<any>;
  gm: string;
}) => {
  const web3ctx = useContext(Web3Context);
  const bestContract = useBestOfWebContract({ web3ctx: web3ctx });
  const [gameRankToCreate, setGemRankToCreate] = React.useState("1");

  return (
    <Flex direction={"column"} alignItems="center">
      <FormLabel mt={"25vh"}>Game rank to create</FormLabel>
      <NumberInput
        aria-label="game rank to create"
        size="sm"
        variant="flushed"
        colorScheme="blue"
        placeholder="Enter pool id"
        value={gameRankToCreate}
        onChange={(value: string) => setGemRankToCreate(value)}
      >
        <NumberInputField px={2} />
      </NumberInput>
      <Tooltip isDisabled={!!web3ctx.account} label="connect to wallet first">
        <Button
          mt={4}
          isDisabled={!web3ctx.account}
          isLoading={bestContract.createGame.isLoading}
          onClick={() => {
            setNewGameId(
              bestContract.contractState.data?.BestOfState.numGames.add("1")
            );
            bestContract.createGame.mutate(
              {
                gameMaster: gm,
                gameRank: gameRankToCreate,
                gameId:
                  bestContract.contractState.data?.BestOfState.numGames.add(
                    "1"
                  ),
              },
              {
                onSuccess: onSuccess,
              }
            );
          }}
        >
          CREATE
        </Button>
      </Tooltip>
    </Flex>
  );
};

const NewGame = chakra(_NewGame);

export default NewGame;
