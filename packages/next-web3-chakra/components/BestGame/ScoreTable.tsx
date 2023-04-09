import {
  Flex,
  Heading,
  Button,
  chakra,
  Thead,
  Th,
  Table,
  Tbody,
  Td,
  Tr,
} from "@chakra-ui/react";
import useBestOfWebContract from "../../hooks/useBestOfWebContract";
import { UseQueryResult, UseQueryOptions } from "react-query";
import { useContext } from "react";
import Web3Context from "../../providers/Web3Provider/context";

const _ScoreTable = ({
  gameId,
  onSuccess,
}: {
  gameId: string;
  onSuccess?: UseQueryOptions["onSuccess"];
}) => {
  const web3ctx = useContext(Web3Context);
  const bestContract = useBestOfWebContract({ web3ctx: web3ctx });

  return (
    <Table>
      <Thead>
        <Th>Player</Th>
        <Th>Last votes</Th>
        <Th>Last proposal</Th>
        <Th>Turn score</Th>
        <Th>Total Score</Th>
      </Thead>
      <Tbody>
        <Tr></Tr>
        <Tr></Tr>
        <Tr></Tr>
        <Tr></Tr>
        <Tr></Tr>
      </Tbody>
    </Table>
  );
};

const ScoreTable = chakra(_ScoreTable);

export default ScoreTable;
