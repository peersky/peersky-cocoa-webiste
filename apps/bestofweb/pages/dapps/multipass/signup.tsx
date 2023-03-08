import React, { useContext, useEffect } from "react";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import {
  Button,
  Box,
  Center,
  Flex,
  Stack,
  Text,
  //   useColorModeValue,
  Heading,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import {
  LibMultipass,
  MultipassDiamond,
} from "../../../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
// import { useWeb3}
// import { Link } from "@chakra-ui/next-js";
// import { FaPassport } from "react-icons/fa";
// import { chains } from "@peersky/next-web3-chakra/providers/Web3Provider";
import { supportedChains } from "@peersky/next-web3-chakra/types";
import { ReactiveContract } from "@peersky/next-web3-chakra/providers/Web3Provider";
const multipassDeploymentMumbai = require("../../../../../deployments/mumbai/Multipass.json");
const mumbaiAddress = multipassDeploymentMumbai.address;
const multipassABI = require("../../../../../abi/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond.json");
const multipassChainAddresses: Partial<Record<supportedChains, string>> = {
  mumbai: mumbaiAddress,
};

const Home = () => {
  const [hydrated, setHydrated] = React.useState(false);
  const [, setDomainState] = React.useState({
    exists: false,
    active: false,
  });
  // const [appScreen, setAppScreen]
  // const [changeChainRequested, setChainChangeRequested] = React.useState(false);
  const { query, appendQueries, appendQuery } = useRouter();
  const web3ctx = useContext(Web3Context);
  const tx = web3ctx.tx({contractAddress: multipassChainAddresses.mumbai, method: })
  const message = query?.message && {
    wallet: web3ctx.account,
    ...JSON.parse(`${Buffer.from(query?.message, "base64").toString("ascii")}`),
  };
  const domain = message?.domain;
  const domainBytes32 = domain ? ethers.utils.formatBytes32String(domain) : "";
  const chainId = query?.chainId;
  console.log("domain", domainBytes32);

  useEffect(() => {
    const getDomainState = async () => {
      const _multipass = new ethers.Contract(
        query.contractAddress,
        multipassABI,
        web3ctx.provider
      ) as MultipassDiamond;
      const state = await _multipass.getDomainState(domainBytes32);

      setDomainState({ exists: !!state.name, active: state.isActive });
    };
    if (domain && web3ctx.account) {
      getDomainState();
    }
  }, [
    domain,
    web3ctx.account,
    domainBytes32,
    query.contractAddress,
    web3ctx.provider,
  ]);

  //   const cardBackgroundColor = useColorModeValue("gray.100", "gray.900");
  //   useEffect(() => {
  //     if (chainId && web3ctx.chainId != chainId) {
  //       // console.log("request change chain id", web3ctx.chainId, chainId);
  //       web3ctx.changeChain(web3ctx.getChainFromId(chainId));
  //     }
  //   }, [chainId, web3ctx]);

  const submitRegistrationTx = async () => {
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const emptyUserQuery = {
      name: ethers.utils.formatBytes32String(""),
      id: ethers.utils.formatBytes32String(""),
      domainName: ethers.utils.formatBytes32String(""),
      wallet: ZERO_ADDRESS,
      targetDomain: ethers.utils.formatBytes32String(""),
    };

    const multipass = new ReactiveContract(
      query.contractAddress,
      multipassABI,
      web3ctx.provider.getSigner()
    );

    multipass["test"].mutate()

    const applicantData: LibMultipass.RecordStruct = {
      id: message.id,
      name: message.name,
      wallet: message.wallet,
      nonce: message.nonce,
      domainName: message.domainName,
    };

    await multipass.functions.register(
      applicantData,
      message.domainName,
      query.signature,
      message.deadline,
      emptyUserQuery,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
  };

  console.log("dbg:", web3ctx.chainId);

  return (
    <Box h="100vh">
      {message && chainId && (
        <Center>
          <Flex
            direction={"column"}
            maxW="500px"
            w="100%"
            bgColor={"gray.100"}
            p={8}
          >
            <Text>
              You are about to associate your address with your username
              <br />
              Association details:
            </Text>
            <Stack
              dir="column"
              p={4}
              //   m={4}
              borderRadius="md"
              spacing={2}
              bgColor={"yellow.400"}
              w="100%"
            >
              <Box>
                Username: {ethers.utils.parseBytes32String(message.name)}
              </Box>
              <Box>User Id: {ethers.utils.parseBytes32String(message.id)}</Box>
              <Box>
                Domain: @: {ethers.utils.parseBytes32String(message.domainName)}
              </Box>
              {/* <Box>nonce: {ethers.BigNumber.from(message.nonce).toString()}</Box>
                          <Box>
                          valid until block #:{" "}
                          {ethers.BigNumber.from(message.deadline).toString()}
                        </Box> */}
            </Stack>
            <Stack
              dir="column"
              p={4}
              //   m={4}
              mt={4}
              borderRadius="md"
              spacing={2}
              bgColor={"yellow.400"}
              w="100%"
            >
              <Box>Will be associated with </Box>
              <Box>{web3ctx.account}</Box>
            </Stack>
            {chainId && web3ctx.chainId == chainId && (
              <Button
                onClick={() => submitRegistrationTx()}
                // isLoading={}
                colorScheme={"blue"}
                placeSelf="center"
              >
                Submit
              </Button>
            )}
            {chainId && web3ctx.chainId != chainId && (
              <Button
                onClick={() =>
                  web3ctx.changeChain(web3ctx.getChainFromId(chainId))
                }
                colorScheme={"blue"}
                placeSelf="center"
              >
                Change network
              </Button>
            )}
          </Flex>
        </Center>
      )}
      {!message && (
        <Box>
          <Heading>
            This page works only with message url query provided
          </Heading>
        </Box>
      )}
    </Box>
  );
};
Home.getLayout = getLayout;
export default Home;
