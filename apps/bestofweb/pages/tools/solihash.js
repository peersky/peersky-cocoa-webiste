import React from "react";
import { Flex, Center, Input, Text, Heading } from "@chakra-ui/react";
import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/BlogLayout";
import { ethers } from "ethers";

const Solihash = () => {
  const [state, setState] = React.useState("");
  return (
    <Flex
      className="ContractsList"
      w="100%"
      minH="100vh"
      direction={"column"}
      px="7%"
      mt="100px"
    >
      <Center>
        <Flex direction={"column"} w="100%" placeContent={"center"}>
          <Heading py={4}>Convert string to solidity hash </Heading>
          <Input
            // variant={"outline"}
            placeholder="type in string"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />

          <Flex direction="column">
            <Heading size="sm" py={4}>
              Resulting hash is:
            </Heading>
            <Text>
              {state && ethers.utils.keccak256(ethers.utils.toUtf8Bytes(state))}
            </Text>
          </Flex>

          <Text pt={12}>How it works:</Text>
          <br />
          <code> ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value))</code>
        </Flex>
      </Center>
    </Flex>
  );
};

Solihash.getLayout = getLayout;
export default Solihash;
