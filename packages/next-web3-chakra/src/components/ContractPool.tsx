import React, { useContext } from "react";

import {
  Flex,
  Skeleton,
  Stack,
  Editable,
  EditablePreview,
  EditableInput,
  Heading,
  Spacer,
  SlideFade,
  chakra,
} from "@chakra-ui/react";
import { useBestOfWebContract } from "../hooks/useBestOfWebContract";
import { queryCacheProps } from "../hooks/hookCommon";
import dynamic from "next/dynamic";
import { Web3MethodForm } from "./Web3MethodForm";
import { Web3Context } from "../providers/Web3Provider/context";
import { useQuery } from "react-query";
import axios from "axios";
import { Metadata } from "./Metadata";
import { JsonFragment } from "@ethersproject/abi";
const STATES = {
  mint: 2,
  batchMint: 3,
};

const ReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
});

const ContractPool = ({
  address,
  poolId,
  ...props
}: {
  address: string;
  poolId: string;
}) => {
  const [isOpen, onOpen] = React.useState(false);
  const [state, setState] = React.useState(STATES.mint);
  const web3ctx = useContext(Web3Context);
  const bestContract = useBestOfWebContract({
    gameId: poolId,
    web3ctx: web3ctx,
  });
  const metadata = useQuery(
    ["link", bestContract.rankTokenURI.data],
    (query: any) => {
      return axios.get(query.queryKey[1]).then((r: any) => r.data);
    },
    {
      ...queryCacheProps,
      enabled:
        !!bestContract.rankTokenURI.data && bestContract.rankTokenURI.isSuccess,
    }
  );
  if (!web3ctx.provider) return <>"loading..."</>;
  const contract = bestContract.getContract(
    web3ctx.getChainFromId(web3ctx.chainId),
    web3ctx.provider
  );
  const t = contract.interface.getFunction("setJoinRequirements");
  return (
    <Flex
      className="TerminuPool"
      direction={"column"}
      bgColor="blue.1000"
      flexWrap={"wrap"}
      pt={4}
      px={0}
      w="100%"
      {...props}
    >
      <Heading
        size="sm"
        borderBottomWidth={1}
        w="100%"
        my={1}
        borderColor="blue.500"
      >
        Pool id {poolId}
      </Heading>
      <Flex p={1} direction={"row"} flexWrap="wrap" w="100%">
        <Metadata
          boxShadow={"md"}
          w="30%"
          borderRadius="md"
          borderColor={"blue.1200"}
          borderWidth={"3px"}
          px={[0, 4]}
          metadata={metadata.data}
        />

        <Stack
          direction={"column"}
          py={4}
          w="70%"
          flexBasis={"400"}
          flexGrow={1}
          px={[0, 4]}
        >
          <code key={"Controller"}>
            Controller:
            <Skeleton
              colorScheme={"orange"}
              isLoaded={
                !bestContract.gameState.isLoading &&
                !bestContract.setJoinRequirements.isLoading
              }
            >
              <Web3MethodForm
                rendered={true}
                key={`cp-setJoinRequirements-mint`}
                method={t as any as JsonFragment}
                contractAddress={contract.address}
              />
            </Skeleton>
          </code>
          <code key={"Supply"}>
            Supply:
            {/* <Flex
              px={2}
              fontSize="16px"
              h="27px"
              bgColor={"blue.700"}
              alignItems="center"
              wordBreak={"break-all"}
            >
              {bestContract.contractState.data?.TBGSEttings.blocksPerTurn}{" "}
              <Spacer />{" "}
              <Button
                // hidden={
                //   bestContract.contractState.data?.BestOfState
                //     .rankTokenAddress !== web3ctx.account
                // }
                size="xs"
                variant={"ghost"}
                py={1}
                colorScheme="orange"
                onClick={() => {
                  if (state === STATES.mint) {
                    onOpen((current) => !current);
                  } else {
                    setState(() => STATES.mint);
                    onOpen(true);
                  }
                }}
              >
                Mint more supply
              </Button>
            </Flex> */}
            {state != 0 && (
              <SlideFade in={isOpen}>
                <Flex
                  w="100%"
                  transition={"1s"}
                  display={isOpen ? "flex" : "none"}
                  m={0}
                  justifyContent="center"
                  flexGrow={1}
                  key={state}
                >
                  {/* {state === STATES.mint && (
                    <Web3MethodForm
                      w="100%"
                      bgColor="blue.700"
                      key={`cp-Web3MethodForm-mint`}
                      onSuccess={() => {
                        bestContract.contractState.refetch();
                      }}
                      rendered={true}
                      hide={["data"]}
                      argumentFields={{
                        data: {
                          placeholder: "",
                          initialValue: web3ctx.web3.utils.utf8ToHex(""),
                        },
                        poolID: {
                          placeholder: "",
                          initialValue: poolId,
                        },
                      }}
                      method={
                        web3ctx.getMethodsABI<
                          BestOfDiamond["createGame(address,uint256)"]
                        >
                      }
                      contractAddress={address}
                    />
                  )} */}
                </Flex>
              </SlideFade>
            )}
          </code>
          <code key={"capacity"}>
            Capacity:
            <Flex
              px={2}
              fontSize="16px"
              w="100%"
              maxW="100%"
              bgColor={"blue.700"}
              alignItems="center"
              wordBreak={"break-all"}
            >
              10 <Spacer />{" "}
            </Flex>
          </code>
          <code key={`uri-uri`}>
            URI:
            <Skeleton colorScheme={"orange"} isLoaded={true}>
              <Editable
                submitOnBlur={false}
                bgColor={"blue.700"}
                size="sm"
                fontSize={"sm"}
                textColor="gray.500"
                w="100%"
                minW={["280px", "300px", "360px", "420px", null]}
                variant={"outline"}
                // isDisabled={poolState.data?.controller !== web3ctx.account}
                // defaultValue={poolState.data?.uri}
                placeholder="Set URI here"
                selectAllOnFocus={true}
                // onSubmit={(nextValue) => {
                //   setPoolURI.mutate(
                //     { uri: nextValue, poolId: poolId },
                //     {
                //       onSettled: () => {
                //         poolState.refetch();
                //       },
                //     }
                //   );
                // }}
              >
                <EditablePreview w="100%" px={2} cursor="text" />
                <EditableInput w="100%" px={2} />
              </Editable>
            </Skeleton>
          </code>
          <Skeleton isLoaded={!bestContract.rankTokenURI.isLoading}>
            {bestContract.rankTokenURI?.data && (
              <></>
              //   <Box cursor="crosshair" overflowWrap={"break-word"}>
              //     <ReactJson
              //       name="metadata"
              //       collapsed
              //       style={{
              //         cursor: "text",
              //         lineBreak: "anywhere",
              //       }}
              //       src={bestContract.rankTokenURI?.data ?? ""}
              //       theme="harmonic"
              //       displayDataTypes={false}
              //       displayObjectSize={false}
              //       collapseStringsAfterLength={128}
              //     />
              //   </Box>
            )}
          </Skeleton>
        </Stack>
        {/* </Flex> */}
      </Flex>
    </Flex>
  );
};

export const ContractsPool = chakra(React.memo(ContractPool));
