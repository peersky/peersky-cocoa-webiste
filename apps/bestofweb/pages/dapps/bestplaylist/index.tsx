import React, { useContext, useEffect } from "react";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import { Box, Flex } from "@chakra-ui/react";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import { SupportedChains } from "@peersky/next-web3-chakra/types";
import bestOfWebDeploymentMumbai from "../../../../../deployments/mumbai/BestOfGame.json";
import BestOfWeb from "@peersky/next-web3-chakra/components/BestOfWeb";
import JoinGame from "@peersky/next-web3-chakra/components/BestGame/JoinGame";
import OpenGame from "@peersky/next-web3-chakra/components/BestGame/OpenGame";
import NewGame from "@peersky/next-web3-chakra/components/BestGame/NewGame";
import SetReqs from "@peersky/next-web3-chakra/components/BestGame/SetReqs";
import { BigNumberish } from "ethers";
const artifacts: Partial<
  Record<SupportedChains, { contractAddress: string; abi: any[] }>
> = {
  mumbai: {
    contractAddress: bestOfWebDeploymentMumbai.address,
    abi: bestOfWebDeploymentMumbai.abi,
  },
};

const Home = () => {
  // const [appScreen, setAppScreen]
  // const [changeChainRequested, setChainChangeRequested] = React.useState(false);
  const { query, appendQueries, appendQuery, nextRouter } = useRouter();
  const web3ctx = useContext(Web3Context);
  useEffect(() => {
    if (query?.chainId && query?.chainId !== web3ctx.chainId) {
      web3ctx.changeChain(web3ctx.getChainFromId(query.chainId));
    }
    if (query.chainId == web3ctx.chainId) {
      const params = new URLSearchParams(nextRouter.query);
      params.delete("chainId");
      const queryString = params.toString();
      const path = `/dapps/bestofweb/${queryString ? `?${queryString}` : ""}`;

      nextRouter.push(path, "", { scroll: false });
    }
  }, [query.chainId, web3ctx.chainId, web3ctx, nextRouter]);

  const [newGameId, setNewGameId] = React.useState<BigNumberish | undefined>(
    "0"
  );
  const router = useRouter();

  const abi = artifacts[web3ctx.getChainFromId(web3ctx.chainId)]?.abi;
  const contractAddress =
    artifacts[web3ctx.getChainFromId(web3ctx.chainId)]?.contractAddress;
  if (!abi || !contractAddress) return "No contracts deployed on this chain";

  return (
    <>
      <Box h="100vh">
        <Flex justifyContent={"center"}>
          {/* <Button>Create new game</Button>
          <Box>Join Price: 0.01 ETH</Box>
          <Box>Rank Token</Box>
          <ControlPanel />

          <Text>Existing games</Text> */}
          {!router.query.action && <BestOfWeb />}
          {router.query.action === "newGame" && (
            <NewGame
              onSuccess={() => {
                router.appendQueries(
                  {
                    action: "setReqs",
                    gameId: newGameId?.toString(),
                  },
                  true,
                  false
                );
              }}
              setNewGameId={setNewGameId}
              gameId={router.query.gameId}
              gm={router.query.gm}
            />
          )}
          {router.query.action === "setreqs" && (
            <SetReqs gameId={router.query.gameId} />
          )}
          {router.query.action === "open" && (
            <OpenGame
              gameId={router.query.gameId}
              onSuccess={() => {
                router.appendQueries(
                  {
                    action: "setReqs",
                    gameId: newGameId?.toString(),
                  },
                  true,
                  false
                );
              }}
            />
          )}
          {router.query.action === "join" && (
            <JoinGame
              gameId={router.query.gameId}
              onSuccess={() => {
                router.drop("action");
              }}
            />
          )}
        </Flex>
      </Box>
    </>
  );
};
Home.getLayout = getLayout;
export default Home;
