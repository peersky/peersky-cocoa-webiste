import React, { useContext } from "react";

import {
  Menu,
  MenuItem,
  MenuList,
  Image,
  MenuButton,
  Button,
  Icon,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { MdOutlineLaptopMac } from "react-icons/md";
import Web3Context from "../providers/Web3Provider/context";
const ChainSelector = ({ selectorScheme }: { selectorScheme?: string }) => {
  const web3Provider = useContext(Web3Context);
  return (
    <code>
      <Menu colorScheme={"blue"} gutter={0} matchWidth={true} variant="rounded">
        <MenuButton
          mx={2}
          px={6}
          h="32px"
          w="250px"
          disabled={!web3Provider.targetChain?.name}
          as={Button}
          rightIcon={<ChevronDownIcon />}
          leftIcon={
            <Image
              display={"inline"}
              h="24px"
              mr={4}
              src={
                web3Provider.targetChain?.name === "ethereum" ||
                web3Provider.targetChain?.name === "goerli"
                  ? "https://s3.amazonaws.com/static.simiotics.com/moonstream/assets/ethereum/eth-diamond-rainbow.png"
                  : web3Provider.targetChain?.name === "localhost"
                  ? ""
                  : "https://s3.amazonaws.com/static.simiotics.com/moonstream/assets/matic-token-inverted-icon.png"
              }
            ></Image>
          }
          variant="menu"
          // size="lg"
        >
          {web3Provider.targetChain?.name ?? "Chain selector"}
        </MenuButton>
        <MenuList pb={20} minW="0px" mt={0} pt={0} placeContent="center">
          <MenuItem
            isDisabled={web3Provider.targetChain?.name === "ethereum"}
            onClick={() => {
              web3Provider.changeChain("ethereum");
            }}
          >
            <Image
              h="24px"
              mr={6}
              src="https://s3.amazonaws.com/static.simiotics.com/moonstream/assets/eth-diamond-black.png"
            ></Image>
            Ethereum
            <Box w="24px"></Box>
          </MenuItem>
          <MenuItem
            // fontSize={"24px"}
            isDisabled={web3Provider.targetChain?.name === "goerli"}
            // _hover={{ backgroundColor: "grey.100" }}
            onClick={() => {
              web3Provider.changeChain("goerli");
            }}
          >
            <Image
              // w="24px"
              h="24px"
              mr={6}
              src="https://s3.amazonaws.com/static.simiotics.com/moonstream/assets/eth-diamond-black.png"
            ></Image>
            goerli
            <Box w="24px"></Box>
          </MenuItem>
          <MenuItem
            // fontSize={"24px"}
            // _hover={{ backgroundColor: "grey.100" }}
            isDisabled={web3Provider.targetChain?.name === "polygon"}
            onClick={() => {
              web3Provider.changeChain("polygon");
            }}
          >
            <Image
              // w="24px"
              h="24px"
              mr={4}
              src="https://s3.amazonaws.com/static.simiotics.com/moonstream/assets/matic-token-inverted-icon.png"
            ></Image>
            Polygon
            <Box w="24px"></Box>
          </MenuItem>
          <MenuItem
            // fontSize={"24px"}
            // _hover={{ backgroundColor: "grey.100" }}
            isDisabled={web3Provider.targetChain?.name === "mumbai"}
            onClick={() => {
              web3Provider.changeChain("mumbai");
            }}
          >
            <Image
              // w="24px"
              h="24px"
              mr={4}
              src="https://s3.amazonaws.com/static.simiotics.com/moonstream/assets/matic-token-inverted-icon.png"
            ></Image>
            Mumbai
            <Box w="24px"></Box>
          </MenuItem>
          <MenuItem
            // fontSize={"24px"}
            // _hover={{ backgroundColor: "grey.100" }}
            isDisabled={web3Provider.targetChain?.name === "localhost"}
            onClick={() => {
              web3Provider.changeChain("localhost");
            }}
          >
            <Icon h="24px" mr={4} as={MdOutlineLaptopMac} />
            Localhost
            <Box w="24px"></Box>
          </MenuItem>
        </MenuList>
      </Menu>
    </code>
  );
};
export default ChainSelector;
