import { useContext, useEffect, useState } from "react";
import {
  chakra,
  Button,
  Tooltip,
  Badge,
  Td,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import {useBestOfWebContract} from "../hooks/useBestOfWebContract";
import {Web3Context} from "../providers/Web3Provider/context";
import {useAppRouter} from "../hooks/useRouter";
import {RouteButton} from "./RouteButton";
import { gameStatusEnum } from "../types/enums";
const _GamePreview = ({ gameId, ...props }: { gameId: string }) => {
  const web3ctx = useContext(Web3Context);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const game = useBestOfWebContract({ gameId, web3ctx });

  const router = useAppRouter();
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
  if (!_gsd) return <Spinner />;

  return (
    <>
      <Td>{gameId}</Td>
      <Td>
        <Badge>{_gsd?.gameRank.toString()}</Badge>
      </Td>
      <Td>{_gsd?.gameMaster}</Td>
      <Td>{_gsd?.createdBy}</Td>
      <Td>
        <Badge>{_gsd.gamePhase}</Badge>
      </Td>
      <Td textAlign="right">
        {isGameCreator && _gsd.gamePhase == "created" && (
          <Button
            onClick={() =>
              router.appendQueries({
                gameId: gameId,
                action: "setreqs",
              })
            }
          >
            set requirements
          </Button>
        )}

        {isInGame && _gsd.gamePhase === gameStatusEnum.open && (
          <Button>Leave game</Button>
        )}

        {_gsd.gamePhase != "created" && (
          <RouteButton
            variant="outline"
            href={`bestplaylist/${gameId}`}
            h="24px"
          >
            View
          </RouteButton>
        )}
        {_gsd.gamePhase == "created" && isGameCreator && (
          <Button onClick={() => bestContract.openRegistration.mutate(gameId)}>
            Open registration
          </Button>
        )}
      </Td>
    </>
  );
};

export const GamePreview = chakra(_GamePreview, {
  //   baseStyle: { bgColor: useColorModeValue("blue.50", "blue.500") },
});
