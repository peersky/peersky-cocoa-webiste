import {
  Flex,
  Stack,
  useColorModeValue,
  Skeleton,
  Heading,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  useDisclosure,
  Input,
  Text,
} from "@chakra-ui/react";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import useAppRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import { useGameMasterBackend } from "@peersky/next-web3-chakra";

import { useContext, useEffect, useState } from "react";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import {
  ScoreTable,
  JoinGame,
  gameStatusEnum,
  useBestOfWebContract,
} from "@peersky/next-web3-chakra";
import { signProposalMessage } from "@daocoacoa/bestofgame-js";

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
  const gmClient = useGameMasterBackend({
    gameId,
    turn: game.gameState.data?.currentTurn.toString(),
  });
  console.log("gmClient", gmClient.playerSaltQuery.data);
  console.log("game.isInGame", game.isInGame);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (router.query.action === "psign") {
      onOpen();
    } else {
      onClose();
    }
  }, [router.query.action, onClose, onOpen]);
  const [proposal, setProposal] = useState("");
  const [signature, setSignature] = useState<string>();
  const bgColor = useColorModeValue("blue.500", "blue.900");
  console.log(
    "State:",
    web3ctx.signer,
    game.gameState.data?.currentTurn,
    gmClient.playerSaltQuery.data
  );
  if (
    !web3ctx.signer ||
    !game.gameState.data?.currentTurn ||
    !gmClient.playerSaltQuery.data
  )
    return "";
  const signer = web3ctx.signer;
  const turn = game.gameState.data.currentTurn.toString();
  const playerSalt = gmClient.playerSaltQuery.data;
  return (
    <Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            Enter your proposal
            <ModalCloseButton onClick={() => router.drop("action")} />
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder="your proposal"
              onChange={(e) => setProposal(e.target.value)}
              value={proposal}
            />
            <Text>{signature}</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={async () => {
                console.log(
                  "going to sign:",
                  proposal,
                  turn,
                  gameId,
                  playerSalt
                );
                const signature = await signProposalMessage(
                  web3ctx.getChainFromId(web3ctx.chainId),
                  signer
                )({
                  proposal: proposal,
                  turn,
                  gameId,
                  salt: playerSalt,
                });
                gmClient.submitProposalMutation.mutate({ proposal, signature });
                // setSignature(signature);
              }}
            >
              Sign
            </Button>
            <Button onClick={() => router.drop("action")}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Stack w="100%" p={4} direction={"column"} bgColor={bgColor}>
        <Flex direction={"column"}>Game #{gameId}</Flex>

        <Skeleton isLoaded={!game.gameState.isLoading}>
          <CardField>
            Current turn {game.gameState.data?.currentTurn.toString()}
          </CardField>
        </Skeleton>
        <Skeleton isLoaded={!game.gameState.isLoading}>
          <CardField>Game status: {game.gameState.data?.gamePhase}</CardField>
        </Skeleton>
        <Skeleton isLoaded={!game.getCurrentTurn.isLoading}>
          <CardField>
            Proposals submitted:{" "}
            {game.getCurrentTurn.data?.proposalEvents?.length ?? 0} /{" "}
            {game.gameState.data.players.length}
          </CardField>
        </Skeleton>
        <Skeleton isLoaded={!game.gameState.isLoading}>
          {game.gameState.data?.gamePhase === gameStatusEnum.open && (
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
          {game.gameState.data?.gamePhase === gameStatusEnum.started && (
            <>
              <Button
                onClick={() =>
                  router.appendQuery("action", "psign", true, true)
                }
                isLoading={game.leaveGame.isLoading}
              >
                Sign a proposal
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
