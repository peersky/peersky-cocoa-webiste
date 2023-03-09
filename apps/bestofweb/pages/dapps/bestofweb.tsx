import React, { useContext, useEffect } from "react";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import {
  Button,
  Box,
  Center,
  Flex,
  Stack,
  useColorModeValue,
  Heading,
  Text,
} from "@chakra-ui/react";
import {
  BestOfDiamond,
  IBestOf,
} from "../../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
import { ethers } from "ethers";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import { LibMultipass } from "../../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
// import { Link } from "@chakra-ui/next-js";
import SplitWithImage from "@peersky/next-web3-chakra/components/SplitWithImage";
// import { FaPassport } from "react-icons/fa";
import { chains } from "@peersky/next-web3-chakra/providers/Web3Provider";
import { SupportedChains } from "@peersky/next-web3-chakra/types";
// const multipassDeploymentMumbai = require("../../../../deployments/mumbai/Multipass.json");
import bestOfWebDeploymentMumbai from "../../../../deployments/mumbai/BestOfGame.json";
import useReadContract from "@peersky/next-web3-chakra/hooks/useReadContract";
import useBestOfWebContract from "@peersky/next-web3-chakra/hooks/useBestOfWebContract";
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
  const { query, appendQueries, appendQuery } = useRouter();
  const web3ctx = useContext(Web3Context);
  const abi = artifacts[web3ctx.getChainFromId(query.chainId)]?.abi;
  const contractAddress =
    artifacts[web3ctx.getChainFromId(query.chainId)]?.contractAddress;
  if (!abi || !contractAddress) throw new Error("no abi or address found");

  // const contract = new ethers.Contract(
  //   contractAddress,
  //   abi,
  //   web3ctx.provider
  // ) as BestOf;

  const bestOfContract = useBestOfWebContract({ web3ctx: web3ctx });
  console.dir(bestOfContract);
  const { data, isSuccess } = useReadContract<
    Awaited<[BestOfDiamond["getContractState"]]>
  >({
    abiItem: web3ctx.getMethodsABI<BestOfDiamond>(abi, "getContractState"),
    address: contractAddress,
  });
  if (!data) {
    return "";
  }

  const _data = data[0] as any as IBestOf.ContractStateStructOutput;
  console.log(_data.BestOfState);

  return (
    <Box h="100vh">
      <Flex>
        <Button>Create new game</Button>
        <Box>Join Price: 0.01 ETH</Box>
        <Box>Rank Token</Box>

        <Text>Existing games</Text>
      </Flex>
    </Box>
  );
};
Home.getLayout = getLayout;
export default Home;
