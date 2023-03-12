import React, { useContext } from "react";
import {
  Flex,
  Button,
  chakra,
  Stack,
  Spinner,
  Editable,
  EditablePreview,
  EditableInput,
  Skeleton,
  Text,
  ButtonGroup,
  SlideFade,
  FlexProps,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import Web3Context from "../providers/Web3Provider/context";
import useBestOfWebContract from "../hooks/useBestOfWebContract";
import { ethers } from "ethers";
const STATES = {
  withdraw: 1,
  createPool: 2,
};
const ControllerPanel = ({
  address,
  isController,
  ...props
}: {
  isController: boolean;
  address: string;
}) => {
  const web3ctx = useContext(Web3Context);

  const [isOpen, onOpen] = React.useState(false);
  const [state, setState] = React.useState(STATES.createPool);

  const bestContract = useBestOfWebContract({
    web3ctx: web3ctx,
  });

  if (
    bestContract.contractState.isLoading ||
    bestContract.rankTokenBalance.isLoading
  )
    return <Spinner />;
  return (
    <>
      <Flex {...props}>
        <Stack direction={"column"} w="100%">
          <Flex
            justifyContent={"center"}
            fontWeight="600"
            textColor={"blue.50"}
            direction="column"
            px={4}
          >
            <Stack direction={"column"} py={4}>
              <code key={"BasePrice"}>
                Join game price
                <Editable
                  submitOnBlur={false}
                  bgColor={"blue.700"}
                  size="sm"
                  fontSize={"sm"}
                  w="100%"
                  minW={["280px", "300px", "360px", "420px", null]}
                  variant={"outline"}
                  placeholder={""}
                  defaultValue={
                    bestContract.contractState.data?.BestOfState
                      .joinGamePrice &&
                    ethers.utils.formatEther(
                      bestContract.contractState.data?.BestOfState.joinGamePrice
                    )
                  }
                  isDisabled={true}
                  //   onSubmit={(nextValue) => {
                  //     terminus.setPoolBasePrice.mutate(nextValue);
                  //   }}
                >
                  <Skeleton colorScheme={"orange"} isLoaded={true}>
                    <EditablePreview w="100%" px={2} />
                    <EditableInput w="100%" px={2} />
                  </Skeleton>
                </Editable>
              </code>
              <code key={"RankToken"}>
                Rank token:
                <Editable
                  submitOnBlur={false}
                  bgColor={"blue.700"}
                  size="sm"
                  fontSize={"sm"}
                  w="100%"
                  minW={["280px", "300px", "360px", "420px", null]}
                  variant={"outline"}
                  placeholder={""}
                  defaultValue={
                    bestContract.contractState.data?.BestOfState
                      .rankTokenAddress
                  }
                  isDisabled={true}
                  //   onSubmit={(nextValue) => {
                  //     terminus.setPaymentToken.mutate(nextValue);
                  //   }}
                >
                  <Skeleton colorScheme={"orange"} isLoaded={true}>
                    <EditablePreview w="100%" px={2} />
                    <EditableInput w="100%" px={2} />
                  </Skeleton>
                </Editable>
              </code>
              <code key={"game price"}>
                Game price:
                <Editable
                  submitOnBlur={false}
                  bgColor={"blue.700"}
                  size="sm"
                  fontSize={"sm"}
                  w="100%"
                  minW={["280px", "300px", "360px", "420px", null]}
                  variant={"outline"}
                  placeholder={""}
                  defaultValue={
                    bestContract.contractState.data?.BestOfState.gamePrice &&
                    ethers.utils.formatEther(
                      bestContract.contractState.data?.BestOfState.gamePrice
                    )
                  }
                  isDisabled={true}
                  //   onSubmit={(nextValue) => {
                  //     if (web3ctx.web3.utils.isAddress(nextValue)) {
                  //       terminus.setController.mutate(nextValue);
                  //     }
                  //   }}
                >
                  <Skeleton colorScheme={"orange"} isLoaded={true}>
                    <EditablePreview w="100%" px={2} />
                    <EditableInput w="100%" px={2} />
                  </Skeleton>
                </Editable>
              </code>

              <code key={"npools"}>
                {"Number of games: "}
                <Skeleton display={"inline"} isLoaded={true}>
                  <Text display={"inline"}>
                    {/* {ethers.utils.formatEther( */}
                    {bestContract.contractState.data?.BestOfState.numGames.toString()}
                    {/* )} */}
                    {/* {"terminus.contractState.data?.totalPools"} */}
                  </Text>
                  <ButtonGroup
                    flexWrap={"wrap"}
                    justifyContent="center"
                    hidden={!isController}
                  >
                    <Button
                      isActive={false && isOpen}
                      key={`createpool`}
                      // colorScheme={"green"}
                      size="sm"
                      disabled={true}
                      mx={4}
                      // variant={"ghost"}
                      //   onClick={() => {
                      //     if (state === STATES.createPool) {
                      //       onOpen((current) => !current);
                      //     } else {
                      //       setState(() => STATES.createPool);
                      //       onOpen(true);
                      //     }
                      //   }}
                    >
                      Create game
                    </Button>
                    {/* <Button
                      isActive={false && isOpen}
                      key={`withdraw`}
                      colorScheme={"orange"}
                      size="sm"
                      variant={"ghost"}
                      // onClick={() => bestContract.createGame.mutate({ gameM })}
                    >
                      withdraw payments
                    </Button> */}
                  </ButtonGroup>
                </Skeleton>
              </code>
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
                    {state === STATES.withdraw && (
                      <></>
                      //   <Web3MethodForm
                      //     w="100%"
                      //     key={`cp-Web3MethodForm-with`}
                      //     maxW="660px"
                      //     // onSuccess={() => terminus.contractState.refetch()}
                      //     rendered={true}
                      //     hide={["data"]}
                      //     method={getMethodsABI<MockTerminus["methods"]>(
                      //       terminusABI,
                      //       "withdrawPayments"
                      //     )}
                      //     contractAddress={address}
                      //   />
                    )}
                    {state === STATES.createPool && (
                      <></>
                      //   <Web3MethodForm
                      //     w="100%"
                      //     key={`cp-Web3MethodForm-with`}
                      //     maxW="660px"
                      //     onSuccess={() => terminus.contractState.refetch()}
                      //     rendered={true}
                      //     hide={["data"]}
                      //     method={getMethodsABI<MockTerminus["methods"]>(
                      //       terminusABI,
                      //       "createPoolV1"
                      //     )}
                      //     contractAddress={address}
                      //   />
                    )}
                  </Flex>
                </SlideFade>
              )}
              <Skeleton isLoaded={true}>
                {true && (
                  <></>
                  //   <Box cursor="crosshair" overflowWrap={"break-word"}>
                  //     <ReactJson
                  //       name="metadata"
                  //       collapsed
                  //       style={{
                  //         cursor: "text",
                  //         lineBreak: "anywhere",
                  //       }}
                  //       src={terminus.contractJSON.data}
                  //       theme="harmonic"
                  //       displayDataTypes={false}
                  //       displayObjectSize={false}
                  //       collapseStringsAfterLength={128}
                  //     />
                  //   </Box>
                )}
              </Skeleton>
              <Accordion allowToggle>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        Configuration details
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <code key={"URI"}>
                      Blocks per turn:
                      <Editable
                        submitOnBlur={false}
                        bgColor={"blue.700"}
                        size="sm"
                        fontSize={"sm"}
                        w="100%"
                        minW={["280px", "300px", "360px", "420px", null]}
                        variant={"outline"}
                        placeholder={bestContract.contractState.data?.TBGSEttings.blocksPerTurn.toString()}
                        defaultValue={""}
                        isDisabled={"" || !isController}
                        //   onSubmit={(nextValue) => {
                        //     terminus.setURI.mutate({ uri: nextValue });
                        //   }}
                      >
                        <Skeleton colorScheme={"orange"} isLoaded={true}>
                          <EditablePreview w="100%" px={2} />
                          <EditableInput w="100%" px={2} />
                        </Skeleton>
                      </Editable>
                    </code>
                    <code key={"URI"}>
                      Maximum participants:
                      <Editable
                        submitOnBlur={false}
                        bgColor={"blue.700"}
                        size="sm"
                        fontSize={"sm"}
                        w="100%"
                        minW={["280px", "300px", "360px", "420px", null]}
                        variant={"outline"}
                        placeholder={bestContract.contractState.data?.TBGSEttings.maxPlayersSize.toString()}
                        defaultValue={""}
                        isDisabled={"" || !isController}
                        //   onSubmit={(nextValue) => {
                        //     terminus.setURI.mutate({ uri: nextValue });
                        //   }}
                      >
                        <Skeleton colorScheme={"orange"} isLoaded={true}>
                          <EditablePreview w="100%" px={2} />
                          <EditableInput w="100%" px={2} />
                        </Skeleton>
                      </Editable>
                    </code>
                    <code key={"URI"}>
                      Minimum participants:
                      <Editable
                        submitOnBlur={false}
                        bgColor={"blue.700"}
                        size="sm"
                        fontSize={"sm"}
                        w="100%"
                        minW={["280px", "300px", "360px", "420px", null]}
                        variant={"outline"}
                        placeholder={bestContract.contractState.data?.TBGSEttings.minPlayersSize.toString()}
                        defaultValue={""}
                        isDisabled={"" || !isController}
                        //   onSubmit={(nextValue) => {
                        //     terminus.setURI.mutate({ uri: nextValue });
                        //   }}
                      >
                        <Skeleton colorScheme={"orange"} isLoaded={true}>
                          <EditablePreview w="100%" px={2} />
                          <EditableInput w="100%" px={2} />
                        </Skeleton>
                      </Editable>
                    </code>
                    <code key={"URI"}>
                      Blocks to join:
                      <Editable
                        submitOnBlur={false}
                        bgColor={"blue.700"}
                        size="sm"
                        fontSize={"sm"}
                        w="100%"
                        minW={["280px", "300px", "360px", "420px", null]}
                        variant={"outline"}
                        placeholder={bestContract.contractState.data?.TBGSEttings.blocksToJoin.toString()}
                        defaultValue={""}
                        isDisabled={"" || !isController}
                        //   onSubmit={(nextValue) => {
                        //     terminus.setURI.mutate({ uri: nextValue });
                        //   }}
                      >
                        <Skeleton colorScheme={"orange"} isLoaded={true}>
                          <EditablePreview w="100%" px={2} />
                          <EditableInput w="100%" px={2} />
                        </Skeleton>
                      </Editable>
                    </code>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Stack>
          </Flex>
        </Stack>
      </Flex>
    </>
  );
};
export default chakra<any, FlexProps>(ControllerPanel, {
  baseStyle: {
    w: "100%",
    direction: ["column", "row"],
    bgColor: "orange.100",
  },
});
