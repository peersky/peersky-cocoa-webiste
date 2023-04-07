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
} from "@chakra-ui/react";
import useBestOfWebContract from "../hooks/useBestOfWebContract";
import Web3Context from "../providers/Web3Provider/context";
import useAppRouter from "../hooks/useRouter";
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
}: useRequirementsArguments) => {
  const cReq = useRequirements({
    gameId,
    web3ctx,
    reqId,
    reqAddress,
    contractType,
  });
  return (
    <Table>
      <Thead>
        <Th>Type</Th>
        <Th>Amount</Th>
      </Thead>
      <Tbody>
        {
          cReq.contractRequirement.data && (
            <>
              <Tr>
                <Td>Have</Td>
                <Td>{cReq.contractRequirement.data.have.amount.toString()}</Td>
              </Tr>
              <Tr>
                <Td>Bet</Td>
                <Td>{cReq.contractRequirement.data.bet.amount.toString()}</Td>
              </Tr>
              <Tr>
                <Td>Pay</Td>
                <Td>{cReq.contractRequirement.data.pay.amount.toString()}</Td>
              </Tr>
              <Tr>
                <Td>Lock</Td>
                <Td>{cReq.contractRequirement.data.lock.amount.toString()}</Td>
              </Tr>
              <Tr>
                <Td>Burn</Td>
                <Td>{cReq.contractRequirement.data.burn.amount.toString()}</Td>
              </Tr>
            </>
          )
          //   Object.keys(cReq.contractRequirement.data).map((key) => {
          //     return (
          //       <Tr>
          //         <Td>{key}</Td>
          //         <Td>{cReq.contractRequirement.data?[key]?.amount}</Td>
          //       </Tr>
          //     );
          //   })
        }
      </Tbody>
    </Table>
  );
};

const _JoinRequirements = ({ gameId, ...props }: { gameId: string }) => {
  const web3ctx = useContext(Web3Context);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const game = useBestOfWebContract({ gameId, web3ctx });
  enum gameStatusEnum {
    created = "created",
    open = "open",
    started = "started",
    lastTurn = "last turn",
    overtime = "overtime",
    finished = "finished",
    notFound = "not found",
  }

  const router = useAppRouter();
  const [isGameCreator, setIsGameCreator] = useState(false);
  const [isInGame, setIsInGame] = useState(false);

  const bestContract = useBestOfWebContract({
    web3ctx: web3ctx,
  });
  const _gsd = game.gameState.data;
  useEffect(() => {
    if (_gsd?.createdBy === web3ctx.account) {
      setIsGameCreator(true);
    } else {
      setIsGameCreator(false);
    }
    if (game.playersGame.data?.eq(gameId)) {
      setIsInGame(true);
    } else {
      setIsInGame(false);
    }
  }, [web3ctx.account, _gsd?.createdBy]);
  const gameStatus = _gsd?.isFinished
    ? gameStatusEnum["finished"]
    : _gsd?.isOvetime
    ? gameStatusEnum["overtime"]
    : _gsd?.isLastTurn
    ? gameStatusEnum["lastTurn"]
    : _gsd?.isOpen
    ? gameStatusEnum["open"]
    : _gsd?.gameMaster
    ? gameStatusEnum["created"]
    : gameStatusEnum["notFound"];
  _gsd?.joinRequirements.conctractAddresses;
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
            {_gsd.joinRequirements?.conctractAddresses &&
              _gsd.joinRequirements.conctractAddresses.map(
                (address: string, idx) => {
                  return (
                    <Tr>
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

const JoinRequirements = chakra(_JoinRequirements, {
  //   baseStyle: { bgColor: useColorModeValue("blue.50", "blue.500") },
});
export default JoinRequirements;
