import React, { useContext, useState } from "react";
import {
  Flex,
  FormLabel, NumberInput,
  NumberInputField,
  Button,
  Spacer,
  Text,
  Heading,
  SlideFade,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th, TableContainer, Tooltip
} from "@chakra-ui/react";
import ControlPanel from "./ConrolPanel";
import useBestOfWebContract from "../hooks/useBestOfWebContract";
import Web3Context from "../providers/Web3Provider/context";
import Paginator from "./Paginator";
import Web3MethodForm from "./Web3MethodForm";
import Metadata from "./Metadata";
import useLink from "../hooks/useLink";
import { BestOfDiamond } from "../../../types/typechain";
import { BigNumberish } from "ethers";
import useAppRouter from "../hooks/useRouter";
import GamePreview from "./GamePreview";
import NewRequirement from "./NewRequirement";
const STATES = {
  mint: 1,
  batchMint: 2,
};
const BestOfWeb = () => {
  const [isOpen, onOpen] = React.useState(false);
  const [state, setState] = React.useState(STATES.mint);
  const [poolToCheck, setPoolToCheck] = useState<number>();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(0);
  const router = useAppRouter();

  // const { contractAddress } = router.query;
  const web3ctx = useContext(Web3Context);

  // const terminus = useTerminusContract({
  //   address: contractAddress,
  //   ctx: web3ctx,
  // });

  const bestContract = useBestOfWebContract({
    web3ctx: web3ctx,
  });

  const uri = useLink({ link: bestContract.rankTokenURI.data });
  const handleKeypress = (e: any) => {
    //it triggers by pressing the enter key
    if (e.charCode === 13) {
      // handleSubmit();
    }
  };

  // const handleSubmit = () => {
  //   router.push({
  //     pathname: "/terminus/details",
  //     query: {
  //       contractAddress: contractAddress,
  //       poolId: poolToCheck,
  //     },
  //   });
  // };
  const [gameRankToCreate, setGemRankToCreate] = React.useState("1");
  const [newGameId, setNewGameId] = React.useState<BigNumberish | undefined>(
    "0"
  );
  const { abi, contractAddress } = bestContract.getArtifact(
    web3ctx.getChainFromId(web3ctx.chainId)
  );
  if (!contractAddress)
    return <Text>{"Please specify terminus address "}</Text>;
  // if (terminus.contractState.isLoading || !terminus.contractState.data)
  //   return <Spinner />;
  return (
    <>
      {router.query.action !== "newgame" &&
        router.query.action !== "setreqs" && (
          <Flex
            w="100%"
            minH="100vh"
            direction={"column"}
            id="flexid"
            alignSelf={"center"}
          >
            <Flex bgColor="blue.1000" p={[0, 0, 4, null]} direction="column">
              <Skeleton isLoaded={!uri.isLoading}>
                <Heading
                  as="h2"
                  size="md"
                  borderBottomWidth={"2px"}
                  mb={2}
                  mx={2}
                >
                  {uri.data?.name}
                </Heading>
              </Skeleton>
              <Flex direction={"row"} bgColor="blue.1000" flexWrap={"wrap"}>
                {uri?.data && (
                  <Metadata
                    boxShadow={"md"}
                    w="50%"
                    borderRadius="md"
                    borderColor={"blue.1200"}
                    borderWidth={"3px"}
                    p={4}
                    metadata={uri?.data}
                  />
                )}
                <ControlPanel
                  flexGrow={1}
                  minW={["280px", "320px", "420px", null]}
                  w="50%"
                  borderRadius={"md"}
                  // my={2}
                  bgColor="blue.600"
                  py={4}
                  direction={["column", "row"]}
                  address={contractAddress}
                  isController={true}
                />
              </Flex>
            </Flex>
            <Flex
              w="100%"
              direction="column"
              bgColor={"blue.600"}
              placeItems="center"
              my={4}
            >
              <Flex
                w="100%"
                p={2}
                placeItems="center"
                direction={"row"}
                flexWrap="wrap"
              >
                <FormLabel size="lg" pt={2}>
                  See pool details:
                </FormLabel>
                <NumberInput
                  size="sm"
                  variant="flushed"
                  colorScheme="blue"
                  placeholder="Enter pool id"
                  onKeyPress={handleKeypress}
                  value={poolToCheck}
                  onChange={(value: string) => setPoolToCheck(Number(value))}
                >
                  <NumberInputField px={2} />
                </NumberInput>
                <Button
                  mx={4}
                  // onClick={() => handleSubmit()}
                  size="sm"
                  variant={"solid"}
                  colorScheme="orange"
                >
                  See pool details
                </Button>
                <Spacer />
                <Button
                  hidden={false}
                  isActive={state === STATES.batchMint && isOpen}
                  key={`batchmint`}
                  colorScheme={"orange"}
                  size="sm"
                  variant={"ghost"}
                  onClick={() => {
                    if (state === STATES.batchMint) {
                      onOpen((current) => !current);
                    } else {
                      setState(() => STATES.batchMint);
                      onOpen(true);
                    }
                  }}
                >
                  Batch mint
                </Button>
              </Flex>
              {state === STATES.batchMint && (
                <SlideFade in={isOpen}>
                  <Web3MethodForm
                    mb={4}
                    w="100%"
                    display={isOpen ? "flex" : "none"}
                    key={`cp-Web3MethodForm-batchMint`}
                    maxW="660px"
                    onSuccess={() => bestContract.contractState.refetch()}
                    // argumentFields={{
                    //   data: {
                    //     placeholder: "",
                    //     initialValue: ethers.utils.hexlify(""),
                    //   },
                    // }}
                    rendered={true}
                    BatchInputs={["poolIDs", "amounts"]}
                    hide={["data"]}
                    method={web3ctx.getMethodsABI<BestOfDiamond>(
                      abi,
                      "createGame(address,uint256)"
                    )}
                    contractAddress={contractAddress}
                  />
                </SlideFade>
              )}
            </Flex>
            <Paginator
              setPage={setPage}
              setLimit={setLimit}
              paginatorKey={`pools`}
              hasMore={
                page * limit <
                Number(bestContract.contractState.data?.BestOfState.numGames)
              }
              page={page}
              pageSize={limit}
              pageOptions={["5", "10", "25", "50"]}
              my={2}
            >
              <TableContainer minH="300px">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Id</Th>
                      <Th>Rank</Th>
                      <Th>Game master</Th>
                      <Th>Created by</Th>
                      <Th>Status</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bestContract.contractState.data?.BestOfState.numGames.gt(
                      "0"
                    ) &&
                      Array.from(
                        Array(
                          (page + 1) * limit <
                            Number(
                              bestContract.contractState.data?.BestOfState
                                .numGames
                            )
                            ? limit
                            : limit -
                                ((page + 1) * limit -
                                  Number(
                                    bestContract.contractState.data?.BestOfState
                                      .numGames
                                  ))
                        ),
                        (e, i) => {
                          return (
                            <Tr key={i}>
                              <GamePreview gameId={(i + 1).toString()} />
                            </Tr>
                          );
                        }
                      )}
                  </Tbody>
                  <Tfoot></Tfoot>
                </Table>
              </TableContainer>
            </Paginator>
          </Flex>
        )}
      {router.query.action === "newGame" && (
        <Flex direction={"column"} alignItems="center">
          <FormLabel mt={"25vh"}>Game rank to create</FormLabel>
          <NumberInput
            aria-label="game rank to create"
            size="sm"
            variant="flushed"
            colorScheme="blue"
            placeholder="Enter pool id"
            value={gameRankToCreate}
            onChange={(value: string) => setGemRankToCreate(value)}
          >
            <NumberInputField px={2} />
          </NumberInput>
          <Tooltip
            isDisabled={!!web3ctx.account}
            label="connect to wallet first"
          >
            <Button
              mt={4}
              isDisabled={!web3ctx.account}
              isLoading={bestContract.createGame.isLoading}
              onClick={() => {
                setNewGameId(
                  bestContract.contractState.data?.BestOfState.numGames.add("1")
                );
                bestContract.createGame.mutate(
                  {
                    gameMaster: router.query.GM,
                    gameRank: gameRankToCreate,
                    gameId: newGameId,
                  },
                  {
                    onSuccess: () => {
                      router.appendQueries(
                        {
                          action: "setReqs",
                          gameId: newGameId?.toString(),
                        },
                        true,
                        false
                      );
                    },
                  }
                );
              }}
            >
              CREATE
            </Button>
          </Tooltip>
        </Flex>
      )}
      {router.query.action === "setreqs" && (
        <Flex direction="column">
          <Heading>Set joining requirements for your game</Heading>
          <NewRequirement
            onSubmit={(e) => {
              console.log("submitted!", e);
              bestContract.setJoinRequirements.mutate({
                gameId: router.query.gameId,
                config: e.request,
              });
            }}
          />
        </Flex>
      )}
    </>
  );
};

export default BestOfWeb;
