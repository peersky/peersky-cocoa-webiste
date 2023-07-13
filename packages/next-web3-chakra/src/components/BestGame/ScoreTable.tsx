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
  Skeleton,
} from "@chakra-ui/react";
import { useBestOfWebContract } from "../../hooks/useBestOfWebContract";
import { UseQueryResult, UseQueryOptions } from "react-query";
import { useContext } from "react";
import { Web3Context } from "../../providers/Web3Provider/context";

const _ScoreTable = ({
  gameId,
  onSuccess,
}: {
  gameId: string;
  onSuccess?: UseQueryOptions["onSuccess"];
}) => {
  const web3ctx = useContext(Web3Context);
  const bestContract = useBestOfWebContract({
    web3ctx: web3ctx,
    gameId: gameId,
  });

  console.log(
    "bestContract.gameState.data?.players",
    bestContract.gameState.data?.players,
    bestContract.previousTurnStats.data?.voters
  );

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
        {bestContract.gameState.data?.players.map((player, idx) => {
          console.log(
            "bestContract.previousTurnStats.data?.voters",
            bestContract.previousTurnStats.data?.voters
          );
          const prevIndex =
            bestContract.previousTurnStats.data?.voters?.findIndex(
              (voter) => voter === player
            );
          const lastVotes = !!prevIndex
            ? bestContract.previousTurnStats.data?.votesRevealed[prevIndex]
            : "N/A";
          return (
            <Tr>
              <Td>
                <Skeleton isLoaded={!bestContract.gameState.isLoading}>
                  {player}
                </Skeleton>
              </Td>
              <Td>
                <Skeleton isLoaded={!bestContract.previousTurnStats.isLoading}>
                  {lastVotes}
                </Skeleton>
              </Td>
              <Td>
                <Skeleton isLoaded={!bestContract.previousTurnStats.isLoading}>
                  {bestContract.previousTurnStats.data?.votesRevealed[
                    bestContract.previousTurnStats.data?.voters?.findIndex(
                      (voter) => voter === player
                    )
                  ] ?? "N/A"}
                </Skeleton>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export const ScoreTable = chakra(_ScoreTable);
