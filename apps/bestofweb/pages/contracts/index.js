import React from "react";
import { Flex, Center } from "@chakra-ui/react";
import PixelsCard from "@peersky/next-web3-chakra/components/PixelsCard";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";

const CONTRACTS = ["erc20", "erc721", "Multipass", "erc1155"];
const ContractsList = () => {
  return (
    <Flex
      className="ContractsList"
      w="100%"
      minH="100vh"
      bgColor={"blue.1200"}
      direction={"column"}
      px="7%"
      mt="100px"
    >
      <Center>
        <Flex flexWrap={"wrap"}>
          {CONTRACTS.map((contract) => {
            return (
              <PixelsCard
                bgColor={"red.900"}
                w="300px"
                p={4}
                key={`${contract}-contracts`}
                link={`contracts/${contract}`}
                heading={`${contract}`}
                //   imageUrl={assets["lender"]}
                textColor={"white.100"}
                level="h2"
              />
            );
          })}
        </Flex>
      </Center>
    </Flex>
  );
};

ContractsList.getLayout = getLayout;
export default ContractsList;
