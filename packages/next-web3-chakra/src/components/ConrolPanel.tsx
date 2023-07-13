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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
} from "@chakra-ui/react";
import { Web3Context } from "../providers/Web3Provider/context";
import { useBestOfWebContract } from "../hooks/useBestOfWebContract";
import { ethers } from "ethers";
import { getArtifact } from "@daocoacoa/bestofgame-js";
import { BestOfDiamond } from "../types/typechain";
import { useGameMasterBackend } from "../hooks/useGameMasterBackend";
const STATES = {
  newGame: 1,
  setRequirements: 2,
};
const ControllerPanel = ({
  address,
  isController,
  ...props
}: {
  isController: boolean;
  address: string;
}) => {
  const [newGameRank, setNewGameRank] = React.useState("1");
  const web3ctx = useContext(Web3Context);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const [isOpen, onOpen] = React.useState(false);
  const [state, setState] = React.useState(STATES.newGame);

  const bestContract = useBestOfWebContract({
    web3ctx: web3ctx,
  });

  const gmBackend = useGameMasterBackend({});

  console.log(
    "bestContract.gameState.isSuccess",
    bestContract.gameState.isSuccess
  );
  if (
    bestContract.contractState.isLoading ||
    bestContract.rankTokenBalance.isLoading ||
    bestContract.gameState.isLoading ||
    gmBackend.gmAddressQuery.isLoading
  )
    return <Spinner />;

  const gameMaster = gmBackend.gmAddressQuery.data;
  console.log("gameMaster", gameMaster);
  if (!gameMaster) throw new Error("GM not set X_o");
  const test = web3ctx.getMethodsABI<BestOfDiamond>(
    getArtifact(web3ctx.getChainFromId(web3ctx.chainId)).abi,
    "createGame(address,uint256)"
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {state === STATES.newGame && "Create new game"}
            {state === STATES.setRequirements && "Set game requirements"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* {state === STATES.newGame && ( */}
            <NumberInput variant={"outline"} flexBasis="75px" flexGrow={1}>
              <NumberInputField
                placeholder={`Game rank`}
                // textColor={("blue.800")}
                // onKeyPress={onKeyPress}
                value={newGameRank}
                onChange={(event) => setNewGameRank(event.target.value)}
                fontSize={"sm"}
                w="100%"
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() =>
                bestContract.createGame.mutate({
                  gameMaster,
                  gameRank: newGameRank,
                })
              }
            >
              Sumitta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
                      ?.joinGamePrice &&
                    ethers.utils.formatEther(
                      bestContract.contractState.data?.BestOfState.joinGamePrice
                    )
                  }
                  isDisabled={true}
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
                      ?.rankTokenAddress ?? ""
                  }
                  isDisabled={true}
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
                      onClick={onOpen}
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
                  ></Flex>
                </SlideFade>
              )}
              <Skeleton isLoaded={true}></Skeleton>
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
                    <code key={"Blocks per turn"}>
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
                      >
                        <Skeleton colorScheme={"orange"} isLoaded={true}>
                          <EditablePreview w="100%" px={2} />
                          <EditableInput w="100%" px={2} />
                        </Skeleton>
                      </Editable>
                    </code>
                    <code key={"Maximum participants"}>
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
                      >
                        <Skeleton colorScheme={"orange"} isLoaded={true}>
                          <EditablePreview w="100%" px={2} />
                          <EditableInput w="100%" px={2} />
                        </Skeleton>
                      </Editable>
                    </code>
                    <code key={"Minimum participants"}>
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
                      >
                        <Skeleton colorScheme={"orange"} isLoaded={true}>
                          <EditablePreview w="100%" px={2} />
                          <EditableInput w="100%" px={2} />
                        </Skeleton>
                      </Editable>
                    </code>
                    <code key={"Blocks to join"}>
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
export const ControllersPanel = chakra<any, FlexProps>(ControllerPanel, {
  baseStyle: {
    w: "100%",
    direction: ["column", "row"],
    bgColor: "orange.100",
  },
});
