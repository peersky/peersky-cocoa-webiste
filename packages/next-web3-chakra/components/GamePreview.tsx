import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  chakra,
  Flex,
  Skeleton,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import useBestOfWebContract from "../hooks/useBestOfWebContract";
import Web3Context from "../providers/Web3Provider/context";
const _GamePreview = ({ gameId, ...props }: { gameId: string }) => {
  const web3ctx = useContext(Web3Context);
  const game = useBestOfWebContract({ gameId, web3ctx });
  enum gameStatusEnum {
    created = "created",
    open = "open",
    started = "started",
    lastTurn = "last turn",
    overtime = "overtime",
    finished = "finished",
    notFound = "not found",
  }

  const [isGameCreator, setIsGameCreator] = useState(false);

  const _gsd = game.gameState.data;
  useEffect(() => {
    if (_gsd?.createdBy === web3ctx.account) {
      setIsGameCreator(true);
    } else {
      setIsGameCreator(false);
    }
  }, [web3ctx.account, _gsd?.createdBy]);
  const gameStatus = _gsd?.isFinished
    ? gameStatusEnum["finished"]
    : _gsd?.isOvetime
    ? gameStatusEnum["overtime"]
    : _gsd?.isLastTurn
    ? gameStatusEnum["lastTurn"]
    : _gsd?.isOpen
    ? gameStatusEnum["open"]
    : _gsd?.gameMaster
    ? gameStatusEnum["created"]
    : gameStatusEnum["notFound"];
  console.log("gameStatus", gameStatus);
  return (
    <Skeleton isLoaded={!game.gameState.isLoading} w="100%" {...props}>
      <Flex
        borderWidth={"1px"}
        borderColor={useColorModeValue("blue.10", "blue.300")}
        py={4}
        justifyContent={"space-evenly"}
        bgColor={useColorModeValue("blue.50", "blue.500")}
        {...props}
      >
        Game #{gameId}
        <Box>Status: {gameStatus}</Box>
        {isGameCreator && gameStatus == "created" && (
          <Button>set requirements</Button>
        )}
        {!isGameCreator && <Button>Join</Button>}
        <Button>Participants</Button>
      </Flex>
    </Skeleton>
  );
};

const GamePreview = chakra(_GamePreview, {
  //   baseStyle: { bgColor: useColorModeValue("blue.50", "blue.500") },
});
export default GamePreview;
