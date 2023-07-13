import { useContext, useEffect, useState } from "react";
import {
  chakra,
  Button,
  Tooltip,
  Badge,
  Td,
  useDisclosure,
  Skeleton,
  Text,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Tag,
  Flex,
} from "@chakra-ui/react";
import { useBestOfWebContract } from "../hooks/useBestOfWebContract";
import { Web3Context } from "../providers/Web3Provider/context";
import { useAppRouter } from "../hooks/useRouter";
import {
  useRequirementsArguments,
  useRequirements,
} from "../hooks/useRequirements";

const ContractJoinReqs = ({
  gameId,
  web3ctx,
  reqId,
  reqAddress,
  contractType,
  onInsufficient,
}: useRequirementsArguments) => {
  const cReq = useRequirements({
    gameId,
    web3ctx,
    reqId,
    reqAddress,
    contractType,
    onInsufficient,
  });

  useEffect(() => {
    console.log("UE req balance", cReq.requiredBalance.data?.isEnough);
    if (
      !cReq.requiredBalance.data?.isEnough &&
      !cReq.requiredBalance.isLoading &&
      cReq.requiredBalance.isFetched
    ) {
      onInsufficient();
    }
  }, [
    cReq.requiredBalance.isLoading,
    cReq.requiredBalance.data,
    cReq.requiredBalance.isFetched,
    onInsufficient,
  ]);
  console.log("cReq.contractRequirement.data", cReq.contractRequirement.data);
  return (
    <Table>
      <Thead>
        <Th>Type</Th>
        <Th>Amount</Th>
      </Thead>
      <Tbody>
        {
          !!cReq.contractRequirement.data && (
            <>
              <Tr>
                <Td>Have</Td>
                <Td>
                  {cReq.contractRequirement.data?.have?.amount.toString()}
                </Td>
              </Tr>
              <Tr>
                <Td>Bet</Td>
                <Td>{cReq.contractRequirement.data?.bet?.amount.toString()}</Td>
              </Tr>
              <Tr>
                <Td>Pay</Td>
                <Td>{cReq.contractRequirement.data?.pay?.amount.toString()}</Td>
              </Tr>
              <Tr>
                <Td>Lock</Td>
                <Td>
                  {cReq.contractRequirement.data?.lock?.amount.toString()}
                </Td>
              </Tr>
              <Tr>
                <Td>Burn</Td>
                <Td>
                  {cReq.contractRequirement.data?.burn?.amount.toString()}
                </Td>
              </Tr>
              <Flex
                bgColor={cReq.requiredBalance.data?.isEnough ? "green" : "red"}
                p={1}
                mt={1}
                // variant="solid"
              >
                Your token balance:{" "}
                {cReq.requiredBalance.data?.balance?.toString()}
              </Flex>
            </>
          )
          //   Object.keys(cReq.contractRequirement.data?).map((key) => {
          //     return (
          //       <Tr>
          //         <Td>{key}</Td>
          //         <Td>{cReq.contractRequirement.data??[key]?.amount}</Td>
          //       </Tr>
          //     );
          //   })
        }
      </Tbody>
    </Table>
  );
};

const _JoinRequirements = ({
  gameId,
  onInsufficient,
  ...props
}: {
  gameId: string;
  onInsufficient: () => void;
}) => {
  const web3ctx = useContext(Web3Context);
  const game = useBestOfWebContract({ gameId, web3ctx });

  const _gsd = game.gameState.data;
  console.log(
    "_gsd.joinRequirements?.contractAddresses",
    _gsd?.joinRequirements
  );
  return (
    <Skeleton isLoaded={!game.gameState.isLoading}>
      {_gsd?.joinRequirements && (
        <Table>
          <Thead>
            <Th>Contract address</Th>
            <Th>Standard</Th>
            <Th>Token id</Th>
            <Th>Amount</Th>
          </Thead>
          <Tbody>
            {_gsd.joinRequirements?.contractAddresses &&
              _gsd.joinRequirements.contractAddresses.map(
                (address: string, idx) => {
                  return (
                    <Tr key={`requirement-${idx}`}>
                      <Td>{address}</Td>
                      <Td>
                        {_gsd.joinRequirements.contractTypes[idx] === 0
                          ? "ERC20"
                          : _gsd.joinRequirements.contractTypes[idx] === 1
                          ? "ERC1155"
                          : "ERC721"}
                      </Td>
                      <Td>
                        {_gsd.joinRequirements.contractTypes[idx] === 0
                          ? "N/A"
                          : _gsd.joinRequirements.contractIds[idx].toString()}
                      </Td>
                      <Td>
                        <ContractJoinReqs
                          gameId={gameId}
                          web3ctx={web3ctx}
                          reqAddress={address}
                          onInsufficient={onInsufficient}
                          contractType={
                            _gsd.joinRequirements.contractTypes[idx]
                          }
                          reqId={_gsd.joinRequirements.contractIds[idx]}
                        />
                      </Td>
                    </Tr>
                  );
                }
              )}
          </Tbody>
        </Table>
        //   <Text>{_gsd?.joinRequirements.ethValues.have.toString()}</Text>
      )}
    </Skeleton>
  );
};

export const JoinRequirements = chakra(_JoinRequirements, {
  //   baseStyle: { bgColor: useColorModeValue("blue.50", "blue.500") },
});
