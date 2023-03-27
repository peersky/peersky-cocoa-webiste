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
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import { LibMultipass } from "../../../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
// import { Link } from "@chakra-ui/next-js";
import SplitWithImage from "@peersky/next-web3-chakra/components/SplitWithImage";
// import { FaPassport } from "react-icons/fa";
import { chains } from "@peersky/next-web3-chakra/providers/Web3Provider";
import { SupportedChains } from "@peersky/next-web3-chakra/types";
const multipassDeploymentMumbai = require("../../../../../deployments/mumbai/Multipass.json");
const mumbaiAddress = multipassDeploymentMumbai.address;
const multipassABI = require("../../../../../abi/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond.json");
const multipassChainAddresses: Partial<Record<SupportedChains, string>> = {
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
      const _multipass = new ethers.Contract(
        query.contractAddress,
        multipassABI,
        web3ctx.provider
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
    web3ctx.provider,
  ]);

  const cardBackgroundColor = useColorModeValue("gray.100", "gray.900");
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

    const multipass = new ethers.Contract(
      query.contractAddress,
      multipassABI,
      web3ctx.provider.getSigner()
    );

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


  return (
    <Box h="100vh">
      {(!query?.appPage || query?.appPage == "onboarding") && (
        <SplitWithImage
          body={`Multpass is a public open source registry enabling generic way of linking an addess
            in to another domains such as another chains or social media or chat platform.

            Utilizing Multipass alows to:`}
          colorScheme="gray.100"
          imgURL="/lilu.png"
          mirror
          title="Multpass"
          bullets={[
            {
              text: `Lookup address from an app by username in the app`,
              // icon: FaPassport,
              color: "gray.200",
              bgColor: "transparent",
            },
            {
              text: `Lookup user name and Id in some other application`,
              // icon: FaPassport,
              color: "gray.200",
              bgColor: "transparent",
            },
            {
              text: `Lookup user name and id from an address`,
              // icon: FaPassport,
              color: "gray.200",
              bgColor: "transparent",
            },
          ]}
          cta={{
            label: web3ctx.account ? "start" : "connect wallet to start",
            onClick: () => {
              !web3ctx.account && web3ctx.onConnectWalletClick();
              web3ctx.account &&
                appendQuery("appPage", "chainSelector", true, true);
            },
          }}
        />
      )}
      {/* <Box wrap="wrap"> */}
      {query?.appPage == "chainSelector" && (
        <Center>
          <Flex my={4} direction={"column"} w="100%" alignItems={"center"}>
            <Heading> Multipass is deployed on following chains:</Heading>
            <Flex
              wrap="wrap"
              direction={"row"}
              w="100%"
              justifyContent="space-evenly"
              py={4}
            >
              <Button
                onClick={() => {
                  appendQueries({
                    chainId: chains["mumbai"].chainId,
                    contractAddress: mumbaiAddress,
                    appPage: "overview",
                  });
                  if (chains["mumbai"].chainId !== web3ctx.chainId) {
                    web3ctx.changeChain("mumbai");
                  }
                }}
              >
                Mumbai
              </Button>
              <Button
                onClick={() => {
                  appendQueries({
                    chainId: chains["mumbai"].chainId,
                    contractAddress: mumbaiAddress,
                  });
                  if (chains["mumbai"].chainId !== web3ctx.chainId) {
                    web3ctx.changeChain("mumbai");
                  }
                }}
              >
                Goerli
              </Button>
              <Button
                onClick={() => {
                  appendQueries({
                    chainId: chains["mumbai"].chainId,
                    contractAddress: mumbaiAddress,
                  });
                  if (chains["mumbai"].chainId !== web3ctx.chainId) {
                    web3ctx.changeChain("mumbai");
                  }
                }}
              >
                Ethereum
              </Button>
            </Flex>
          </Flex>
        </Center>
      )}
      {chainId && web3ctx.chainId == chainId && !!query.contractAddress && (
        <>
          {multipassChainAddresses[web3ctx.getChainFromId(chainId)] ===
            query.contractAddress && (
            <>
              {query.appPage === "overview" && (
                <Flex>
                  <Button
                    onClick={() =>
                      appendQuery("appPage", "newDomainRequest", true, false)
                    }
                  >
                    Add new domain
                  </Button>
                </Flex>
              )}
            </>
          )}
          {multipassChainAddresses[web3ctx.getChainFromId(chainId)] !==
            ethers.utils.getAddress(query.contractAddress) && (
            <Flex>Unsupported</Flex>
          )}
        </>
      )}
      {query?.appPage == "newDomainRequest" && "Input"}

      {chainId &&
        web3ctx.chainId == chainId &&
        message &&
        query.appPage === "register" && (
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
                <Box>
                  User Id: {ethers.utils.parseBytes32String(message.id)}
                </Box>
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
