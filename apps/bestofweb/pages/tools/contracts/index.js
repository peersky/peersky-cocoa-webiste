import React from "react";
import { Flex, Center } from "@chakra-ui/react";
import PixelsCard from "@peersky/next-web3-chakra/components/PixelsCard";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";

const CONTRACTS = [
  "erc20",
  "erc721",
  "Multipass",
  "erc1155",
  "BestOfGame",
  "RankToken",
];
const COLORS = ["blue", "green", "pink", "orange"];
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
          <PixelsCard
            bgColor={"purple.300"}
            w="300px"
            p={4}
            key={`generic-c-contracts`}
            link={`contracts/generic`}
            heading={`Use my ABI`}
            textColor={"white.100"}
            level="h2"
          />
          {CONTRACTS.map((contract, idx) => {
            return (
              <PixelsCard
                bgColor={`${COLORS[idx % COLORS.length]}.300`}
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
