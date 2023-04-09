import {
  Flex,
  Stack,
  useColorModeValue,
  Skeleton,
  Heading,
} from "@chakra-ui/react";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import useAppRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import useBestOfWebContract, {
  gameStatusEnum,
} from "@peersky/next-web3-chakra/hooks/useBestOfWebContract";
import { useContext } from "react";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import JoinGame from "@peersky/next-web3-chakra/components/BestGame/JoinGame";

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

  return (
    <Flex>
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
              {}
            </>
          )}
        </Skeleton>
        <Skeleton isLoaded={!game.gameState.isLoading}>
          <>
            {!game.isInGame && (
              <CardField>
                <Heading size="sm">Participants</Heading>
                {game.gameState.data?.players &&
                  game.gameState.data?.players.map((player) => {
                    return <Flex key={`player-${player}`}>{player}</Flex>;
                  })}
              </CardField>
            )}
            {}
          </>
        </Skeleton>
      </Stack>
    </Flex>
  );
};

GamePage.getLayout = getLayout;
export default GamePage;
