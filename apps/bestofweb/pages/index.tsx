import React, { useContext, Suspense, lazy } from "react";
import useAppRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import {
  Button,
  Box,
  Center,
  Text,
  Flex,
  Stack,
  Grid,
  GridItem,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
import { LibMultipass } from "../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
import UIContext from "@peersky/next-web3-chakra/providers/UIProvider/context";
const multipassABI = require("../../../abi/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond.json");
import { Link } from "@chakra-ui/next-js";
const Home = () => {
  const cardBgColor = useColorModeValue("gray.100", "gray.700");
  const cardHoverBgColor = useColorModeValue("red.100", "red.700");
  const cardBorderColor = useColorModeValue("gray.300", "gray.700");
  const [hydrated, setHydrated] = React.useState(false);
  const [, setDomainState] = React.useState({
    exists: false,
    active: false,
  });
  const [changeChainRequested, setChainChangeRequested] = React.useState(false);
  const { query } = useAppRouter();
  const domain = query?.domain;
  const domainBytes32 = domain ? ethers.utils.formatBytes32String(domain) : "";
  const web3ctx = useContext(Web3Context);
  const ui = useContext(UIContext);
  const message = query?.message && {
    wallet: web3ctx.account,
    ...JSON.parse(`${Buffer.from(query?.message, "base64").toString("ascii")}`),
  };
  const chainId = query?.chainId;
  const Component = lazy(() => import(`../content/landing.mdx`));

  return <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>;
};
Home.getLayout = getLayout();
export default Home;
