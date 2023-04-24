import {
  Flex,
  Stack,
  useColorModeValue,
  Skeleton,
  Heading,
  Button,
} from "@chakra-ui/react";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import useAppRouter from "@peersky/next-web3-chakra/hooks/useRouter";

import { useContext } from "react";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import {
  ScoreTable,
  JoinGame,
  gameStatusEnum,
  useBestOfWebContract,
} from "@peersky/next-web3-chakra";

const CardField = (props: any) => {
  return (
    <Flex
      direction={"column"}
      bgColor={useColorModeValue("blue.600", "blue.800")}
      p={1}
      px={2}
    >
      {props.children}
    </Flex>
  );
};
const GamePage = () => {
  const router = useAppRouter();
  const gameId = router.params["gameId"];
  const web3ctx = useContext(Web3Context);
  const game = useBestOfWebContract({ gameId: gameId, web3ctx });
  console.log("game.isInGame", game.isInGame);

  return (
    <Flex>
      {" "}
      <Stack
        w="100%"
        p={4}
        direction={"column"}
        bgColor={useColorModeValue("blue.500", "blue.900")}
      >
        <Flex direction={"column"}>Game #{gameId}</Flex>

        <Skeleton isLoaded={!game.gameState.isLoading}>
          <CardField>
            Current turn {game.gameState.data?.currentTurn.toString()}
          </CardField>
        </Skeleton>
        <Skeleton isLoaded={!game.gameState.isLoading}>
          <CardField>Game status: {game.gameStatus}</CardField>
        </Skeleton>
        <Skeleton isLoaded={!game.gameState.isLoading}>
          {game.gameStatus === gameStatusEnum.open && (
            <>
              {!game.isInGame && (
                <CardField>
                  {/* <Heading size="sm">Join requirements</Heading> */}
                  {/* <JoinRequirements gameId={gameId} /> */}
                  <JoinGame gameId={gameId} />
                </CardField>
              )}
              {game.isInGame && (
                <Button
                  onClick={() => game.leaveGame.mutate(gameId)}
                  isLoading={game.leaveGame.isLoading}
                >
                  Leave game
                </Button>
              )}
              <Button
                isDisabled={!game.gameState.data?.canStart}
                isLoading={game.startGame.isLoading}
                onClick={() => game.startGame.mutate(gameId)}
              >
                Start game
              </Button>
            </>
          )}
        </Skeleton>
        <Skeleton isLoaded={!game.gameState.isLoading}>
          <>
            <CardField>
              <Heading size="sm">Participants</Heading>
              <ScoreTable gameId={gameId} />
            </CardField>
            {}
          </>
        </Skeleton>
      </Stack>
    </Flex>
  );
};

GamePage.getLayout = getLayout;
export default GamePage;
