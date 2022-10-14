import React, { useContext, useDebugValue, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import useRouter from "../hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import {
  Button,
  Image,
  useBreakpointValue,
  Box,
  Center,
  Text,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
const multipassABI = require("../../../abi/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond.json");
const Home = () => {
  const bp = useBreakpointValue({ base: "md" });
  const [hydrated, setHydrated] = React.useState(false);
  const [domainState, setDomainState] = React.useState({
    exists: false,
    active: false,
  });
  const [changeChainRequested, setChainChangeRequested] = React.useState(false);
  const { query } = useRouter();
  const domain = query?.domain;
  const domainBytes32 = domain ? ethers.utils.formatBytes32String(domain) : "";
  const web3ctx = useContext(Web3Context);
  const action = query?.action;
  const message = query?.message && {
    wallet: web3ctx.account,
    ...JSON.parse(`${Buffer.from(query?.message, "base64").toString("ascii")}`),
  };
  const chainId = query?.chainId;

  useEffect(() => {
    const getDomainState = async () => {
      const _multipass = new web3ctx.web3.eth.Contract(
        multipassABI,
        query.contractAddress
      );
      const state = await _multipass.methods
        .getDomainState(domainBytes32)
        .call();
      setDomainState({ exists: !!state.name, active: state.isActive });
    };
    if (domain && web3ctx.account) {
      getDomainState();
    }
  }, [domain, web3ctx.account]);

  console.log("domain state", domainState);
  useEffect(() => {
    if (chainId && web3ctx.chainId != chainId) {
      // console.log("request change chain id", web3ctx.chainId, chainId);
      // web3ctx.changeChain(web3ctx.getChainFromId(chainId));
    }
  }, [chainId, web3ctx.chainId, web3ctx.getChainFromId]);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }

  const submitRegistrationTx = async () => {
    console.log("submitting", query.contractAddress);
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const emptyUserQuery = {
      name: ethers.utils.formatBytes32String(""),
      id: ethers.utils.formatBytes32String(""),
      domainName: ethers.utils.formatBytes32String(""),
      wallet: ZERO_ADDRESS,
      targetDomain: ethers.utils.formatBytes32String(""),
    };

    const multipass = new web3ctx.web3.eth.Contract(
      multipassABI,
      query.contractAddress
    );
    console.dir(message);
    console.dir(message.domainName);
    console.dir(query.signature);
    console.dir(message.deadline);
    console.dir(emptyUserQuery);

    await multipass.methods
      .register(
        message,
        message.domainName,
        query.signature,
        message.deadline,
        emptyUserQuery,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      )
      .send({ from: web3ctx.account });
  };

  console.dir(message);
  console.log("nonce", message?.nonce);

  return (
    <Box h="100vh">
      {chainId && web3ctx.chainId != chainId && (
        <Center>
          <Box
            onClick={() => {
              web3ctx.changeChain(web3ctx.getChainFromId(chainId));
              setChainChangeRequested(true);
            }}
            maxW="300px"
            // h="300px"
            borderRadius={"md"}
            bgColor="blue.300"
            placeItems={"center"}
            p={4}
            m={4}
          >
            <Button colorScheme="blue" variant={"outline"}>
              Change chain Id
            </Button>
            {changeChainRequested && (
              <Text>PLease open metamask and change chain</Text>
            )}
          </Box>
        </Center>
      )}
      {chainId && web3ctx.chainId == chainId && (
        <Center>
          <Flex direction={"column"} maxW="500px" w="100%">
            <Stack
              dir="column"
              p={4}
              m={4}
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
                @: {ethers.utils.parseBytes32String(message.domainName)}
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
              m={4}
              borderRadius="md"
              spacing={2}
              bgColor={"yellow.400"}
              w="100%"
            >
              <Box>Will be associated with </Box>
              <Box>{web3ctx.account}</Box>
            </Stack>
            <Button
              onClick={() => submitRegistrationTx()}
              colorScheme={"blue"}
              placeSelf="center"
            >
              Submit
            </Button>
          </Flex>
        </Center>
      )}
      {/* <Navbar h="50px" maxH={"50px"} bgColor="red" /> */}
      {/* {web3ctx.account ?? "No account"}
      {web3ctx.buttonText !== web3ctx.WALLET_STATES.CONNECTED && (
        <Button
          isDisabled={
            web3ctx.WALLET_STATES.UNKNOWN_CHAIN === web3ctx.buttonText
          }
          colorScheme={
            web3ctx.buttonText === web3ctx.WALLET_STATES.CONNECTED
              ? "green"
              : web3ctx.WALLET_STATES.UNKNOWN_CHAIN === web3ctx.buttonText
              ? "red"
              : "green"
          }
          onClick={web3ctx.onConnectWalletClick}
        >
          {web3ctx.buttonText}
          {"  "}
          <Image
            pl={2}
            h="24px"
            src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
          />
        </Button>
      )}
      <br />
      {action}
      <br />
      {gmSignature}
      <br />
      {message} */}
    </Box>
  );
};
Home.getLayout = getLayout;
export default Home;
