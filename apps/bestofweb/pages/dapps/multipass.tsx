import React, { useContext, useEffect } from "react";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import { Button, Box, Center, Text, Flex, Stack } from "@chakra-ui/react";
import { ethers } from "ethers";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import { LibMultipass } from "../../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
const multipassABI = require("../../../../abi/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond.json");
const Home = () => {
  const [hydrated, setHydrated] = React.useState(false);
  const [, setDomainState] = React.useState({
    exists: false,
    active: false,
  });
  const [changeChainRequested, setChainChangeRequested] = React.useState(false);
  const { query } = useRouter();
  const domain = query?.domain;
  const domainBytes32 = domain ? ethers.utils.formatBytes32String(domain) : "";
  const web3ctx = useContext(Web3Context);
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
  }, [
    domain,
    web3ctx.account,
    domainBytes32,
    query.contractAddress,
    web3ctx.web3.eth.Contract,
  ]);

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

    const applicantData: LibMultipass.RecordStruct = {
      id: message.id,
      name: message.name,
      wallet: message.wallet,
      nonce: message.nonce,
      domainName: message.domainName,
    };

    await multipass.methods
      .register(
        applicantData,
        message.domainName,
        query.signature,
        message.deadline,
        emptyUserQuery,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      )
      .send({ from: web3ctx.account });
  };

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
              // isLoading={}
              colorScheme={"blue"}
              placeSelf="center"
            >
              Submit
            </Button>
          </Flex>
        </Center>
      )}
      {/* <Navbar h="50px" maxH={"50px"} bgColor="red" /> */}
      {/* {web3ctx.account ?? "No account"} */}

      {/* <br />
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
