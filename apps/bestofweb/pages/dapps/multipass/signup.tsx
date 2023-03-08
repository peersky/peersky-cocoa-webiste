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
  useColorModeValue,
  Heading,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import { useMutation } from "react-query";
// import MultipassClient from "@daocoacoa/multipass-js";
import {
  LibMultipass,
  MultipassDiamond,
} from "../../../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
// import { useWeb3}
// import { Link } from "@chakra-ui/next-js";
// import { FaPassport } from "react-icons/fa";
// import { chains } from "@peersky/next-web3-chakra/providers/Web3Provider";
import { supportedChains } from "@peersky/next-web3-chakra/types";
import multipassDeploymentMumbai from "../../../../../deployments/mumbai/Multipass.json";
import useToast from "@peersky/next-web3-chakra/hooks/useToast";
// const multipassABI = require("../../../../../abi/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond.json");
const multipassArtifacts: Partial<
  Record<supportedChains, { contractAddress: string; abi: any[] }>
> = {
  mumbai: {
    contractAddress: multipassDeploymentMumbai.address,
    abi: multipassDeploymentMumbai.abi,
  },
};

const Home = () => {
  const [isRegistred, setIsRegistred] = React.useState(false);
  const [, setDomainState] = React.useState({
    exists: false,
    active: false,
  });
  const web3ctx = useContext(Web3Context);
  const { query, appendQueries, appendQuery } = useRouter();
  const multipassABI =
    multipassArtifacts[web3ctx.getChainFromId(query.chainId)]?.abi;
  const contractAddress =
    multipassArtifacts[web3ctx.getChainFromId(query.chainId)]?.contractAddress;
  if (!multipassABI || !contractAddress)
    throw new Error("no multipass abi or address found");
  // const [appScreen, setAppScreen]
  const toast = useToast();
  // const [changeChainRequested, setChainChangeRequested] = React.useState(false);
  const signupTx = useMutation(
    async (args: Parameters<MultipassDiamond["functions"]["register"]>) => {
      if (!contractAddress) throw new Error("no contract address specified");
      const contract = new ethers.Contract(
        contractAddress,
        multipassABI,
        web3ctx.provider.getSigner()
      ) as MultipassDiamond;

      let response;
      console.log("sending tx");
      response = await contract.register(...args);

      return response;
    },
    {
      onSuccess: () => {},
      onError: (error: any) => {
        console.error(error);
        toast(error?.title, "error", "Error");
      },
      onSettled: async () => {
        const _multipass = new ethers.Contract(
          contractAddress,
          multipassABI,
          web3ctx.provider
        ) as MultipassDiamond;
        const query: LibMultipass.NameQueryStruct = {
          name: ethers.utils.formatBytes32String(""),
          id: message.id,
          wallet: ethers.constants.AddressZero,
          domainName: message.domainName,
          targetDomain: ethers.utils.formatBytes32String(""),
        };
        const response = await _multipass.resolveRecord(query);
        console.log("response", response);
        setIsRegistred(response[0]);
      },
    }
  );
  //   const tx = web3ctx.tx({contractAddress: multipassChainAddresses.mumbai, method: })
  const message = React.useMemo(
    () =>
      query?.message && {
        wallet: web3ctx.account,
        ...JSON.parse(
          `${Buffer.from(query?.message, "base64").toString("ascii")}`
        ),
      },
    [query.message, web3ctx.account]
  );
  const domain = message?.domain;
  const domainBytes32 = domain ? ethers.utils.formatBytes32String(domain) : "";
  const chainId = query?.chainId;

  console.log("domain", domainBytes32);
  useEffect(() => {
    const queryUserById = async () => {
      console.log("sdf2", message, contractAddress);
      const _multipass = new ethers.Contract(
        contractAddress,
        multipassABI,
        web3ctx.provider
      ) as MultipassDiamond;
      const query: LibMultipass.NameQueryStruct = {
        name: ethers.utils.formatBytes32String(""),
        id: message.id,
        wallet: ethers.constants.AddressZero,
        domainName: message.domainName,
        targetDomain: ethers.utils.formatBytes32String(""),
      };
      const response = await _multipass.resolveRecord(query);
      console.log("response", response);
      setIsRegistred(response[0]);
    };

    if (
      message &&
      chainId &&
      web3ctx.provider &&
      contractAddress &&
      multipassABI
    ) {
      queryUserById();
    }
  }, [message, chainId, web3ctx.provider, multipassABI, contractAddress]);
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
    multipassABI,
  ]);

  const cardBackgroundColor = useColorModeValue("gray.100", "gray.900");
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

    const applicantData: LibMultipass.RecordStruct = {
      id: message.id,
      name: message.name,
      wallet: web3ctx.account,
      nonce: message.nonce,
      domainName: message.domainName,
    };

    signupTx.mutate([
      applicantData,
      message.domainName,
      query.signature,
      message.deadline,
      emptyUserQuery,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ]);
  };

  return (
    <Box h="100vh">
      {isRegistred && <Heading>Congrats, you are registered!</Heading>}
      {message && chainId && !isRegistred && (
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
              bgColor={cardBackgroundColor}
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
              bgColor={cardBackgroundColor}
              w="100%"
            >
              <Box>Will be associated with </Box>
              <Box>{web3ctx.account}</Box>
            </Stack>
            {chainId && web3ctx.chainId == chainId && (
              <Button
                onClick={() => submitRegistrationTx()}
                isLoading={signupTx.isLoading}
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
