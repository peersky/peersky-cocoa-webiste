import { useContext, useEffect } from "react";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import { Box, Flex } from "@chakra-ui/react";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
// import { Link } from "@chakra-ui/next-js";
// import { FaPassport } from "react-icons/fa";
import { SupportedChains } from "@peersky/next-web3-chakra/types";
// const multipassDeploymentMumbai = require("../../../../deployments/mumbai/Multipass.json");
import bestOfWebDeploymentMumbai from "../../../../deployments/mumbai/BestOfGame.json";
import useBestOfWebContract from "@peersky/next-web3-chakra/hooks/useBestOfWebContract";
import BestOfWeb from "@peersky/next-web3-chakra/components/BestOfWeb";
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

  const abi = artifacts[web3ctx.getChainFromId(web3ctx.chainId)]?.abi;
  const contractAddress =
    artifacts[web3ctx.getChainFromId(web3ctx.chainId)]?.contractAddress;
  const bestOfContract = useBestOfWebContract({ web3ctx: web3ctx });
  if (!abi || !contractAddress) return "No contracts deployed on this chain";

  return (
    <Box h="100vh">
      <Flex justifyContent={"center"}>
        {/* <Button>Create new game</Button>
        <Box>Join Price: 0.01 ETH</Box>
        <Box>Rank Token</Box>
        <ControlPanel />

        <Text>Existing games</Text> */}
        <BestOfWeb />
      </Flex>
    </Box>
  );
};
Home.getLayout = getLayout;
export default Home;
