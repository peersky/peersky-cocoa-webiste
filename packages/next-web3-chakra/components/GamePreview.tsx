import { useContext, useEffect, useState } from "react";
import {
  chakra, Button,
  Tooltip,
  Badge,
  Td, useDisclosure
} from "@chakra-ui/react";
import useBestOfWebContract from "../hooks/useBestOfWebContract";
import Web3Context from "../providers/Web3Provider/context";
const _GamePreview = ({ gameId, ...props }: { gameId: string }) => {
  const web3ctx = useContext(Web3Context);
  const { isOpen, onOpen, onClose } = useDisclosure();
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
  const [isInGame, setIsInGame] = useState(false);

  const bestContract = useBestOfWebContract({
    web3ctx: web3ctx,
  });
  const _gsd = game.gameState.data;
  useEffect(() => {
    if (_gsd?.createdBy === web3ctx.account) {
      setIsGameCreator(true);
    } else {
      setIsGameCreator(false);
    }
    if (game.playersGame.data?.eq(gameId)) {
      setIsInGame(true);
    } else {
      setIsInGame(false);
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
  return (
    <>
      <Td>{gameId}</Td>
      <Td>
        <Badge>{_gsd?.gameRank.toString()}</Badge>
      </Td>
      <Td>
        <Badge>{_gsd?.gameMaster}</Badge>
      </Td>
      <Td>
        <Badge>{_gsd?.createdBy}</Badge>
      </Td>
      <Td>
        <Badge>{gameStatus}</Badge>
      </Td>
      <Td textAlign="right">
        {isGameCreator && gameStatus == "created" && (
          <Button onClick={onOpen}>set requirements</Button>
        )}
        {!isGameCreator && (
          <>
            {isInGame && gameStatus === gameStatusEnum.open && (
              <Button>Leave game</Button>
            )}
            {!isInGame && (
              <Tooltip
                label="Game can be joined only when registration is open by game creator"
                hasArrow
                isDisabled={gameStatus === gameStatusEnum.open}
              >
                <Button isDisabled={gameStatus !== gameStatusEnum.open}>
                  Join
                </Button>
              </Tooltip>
            )}
          </>
        )}
        <Button isDisabled={!_gsd?.players.length || _gsd?.players.length < 0}>
          Participants
        </Button>
      </Td>
    </>
  );
};

const GamePreview = chakra(_GamePreview, {
  //   baseStyle: { bgColor: useColorModeValue("blue.50", "blue.500") },
});
export default GamePreview;
