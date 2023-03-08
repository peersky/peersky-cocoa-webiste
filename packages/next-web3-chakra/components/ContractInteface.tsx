import {
  chakra,
  Flex,
  Editable as _Editable,
  EditablePreview,
  EditableInput,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Badge,
  Text,
  Tag,
  Spacer,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AbiItem } from "web3-utils";
import useAppRouter from "../hooks/useRouter";
import useToast from "../hooks/useToast";
import Web3Context from "../providers/Web3Provider/context";
import StateItem from "./StateItem";
import Web3MethodForm from "./Web3MethodForm";
import {
  AutoComplete,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
  AutoCompleteTag,
} from "@choc-ui/chakra-autocomplete";
import { supportedChains } from "../types";
import { chains } from "../providers/Web3Provider";
import { ethers } from "ethers";

const _ContractInterface = ({
  abi,
  initalContractAddress,
  initialChainId,
  autoCompleteList,
  ...props
}: {
  abi: AbiItem[];
  autoCompleteList?: { address: string; network: supportedChains }[];
  initalContractAddress?: string;
  initialChainId?: number;
}) => {
  const toast = useToast();
  const [contractAddress, setContractAddress] = React.useState(
    initalContractAddress
  );
  const web3ctx = useContext(Web3Context);
  const router = useAppRouter();

  const colorSchemesPerNetwork: { [key in supportedChains]?: string } = {
    mumbai: "blue",
    polygon: "yellow",
    ethereum: "red",
  };
  return (
    <Flex direction={"column"}>
      <AutoComplete
        openOnFocus
        suggestWhenEmpty={false}
        onSelectOption={(nextValue) => {
          let item = nextValue.item as any as {
            address: string;
            network: supportedChains;
          };
          item = nextValue.item.originalValue as any as {
            address: string;
            network: supportedChains;
          };
          if (web3ctx.chainId !== chains[item.network].chainId) {
            web3ctx.changeChain(item.network);
          }
          if (ethers.utils.isAddress(item.address)) {
            setContractAddress(item.address);
            router.appendQueries(
              {
                contractAddress: item.address,
                chainId: chains[item.network].chainId,
              },
              false,
              true
            );
          } else {
            toast("not a checksum address", "error");
          }
        }}
        onSubmit={(nextValue: any) => {
          // if (web3.utils.isAddress(nextValue)) {
          //   setContractAddress(nextValue);
          //   router.appendQuery("contractAddress", nextValue, false, true);
          // } else {
          //   toast("not a checksum address", "error");
          // }
        }}
      >
        <AutoCompleteInput
          bgColor={useColorModeValue("blue.200", "whiteAlpha.700")}
          size="sm"
          fontSize={"sm"}
          textColor="grey.900"
          w="100%"
          minW={["300px", "300px", "360px", "420px", null]}
          variant={"outline"}
          placeholder="Contract address"
        ></AutoCompleteInput>
        <AutoCompleteList>
          {autoCompleteList &&
            autoCompleteList?.map((item, cid) => (
              <AutoCompleteItem
                fontSize={"sm"}
                key={`option-${cid}`}
                value={item ?? initalContractAddress}
              >
                <Text fontSize="sm">{item.address}</Text>
                <Spacer />
                <Tag
                  variant="outline"
                  colorScheme={colorSchemesPerNetwork[item.network]}
                >
                  {item.network}
                </Tag>
              </AutoCompleteItem>
            ))}
        </AutoCompleteList>
      </AutoComplete>
      {/* <_Editable
        bgColor={useColorModeValue("blue.200", "whiteAlpha.700")}
        size="sm"
        fontSize={"sm"}
        textColor="grey.900"
        w="100%"
        minW={["300px", "300px", "360px", "420px", null]}
        variant={"outline"}
        defaultValue={initalContractAddress}
        placeholder="Contract address"
        onSubmit={(nextValue: any) => {
          if (web3.utils.isAddress(nextValue)) {
            setContractAddress(nextValue);
            router.appendQuery("contractAddress", nextValue, false, true);
          } else {
            toast("not a checksum address", "error");
          }
        }}
      >
        <EditablePreview w="100%" px={2} />
        <EditableInput w="100%" px={2} />
      </_Editable> */}
      <Tabs>
        <TabList>
          <Tab>State</Tab>
          <Tab>Write</Tab>
          <Tab>Read</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {contractAddress &&
              abi
                .filter(
                  (element: AbiItem) =>
                    element.type === "function" &&
                    element.stateMutability === "view" &&
                    element.inputs?.length == 0
                )
                .map((element: any, idx: any) => {
                  return (
                    <StateItem
                      w="100%"
                      key={`StateItem-${idx}`}
                      address={contractAddress}
                      m={5}
                      p={5}
                      // maxW="420px"
                      // bgColor={"green.50"}
                      boxShadow="md"
                      abiItem={element}
                      flexDirection="column"
                    />
                  );
                })}
          </TabPanel>
          <TabPanel>
            <Flex
              direction={"column"}
              {...props}
              justifyContent="flex-start"
              minH="100vh"
            >
              <Flex
                placeSelf={"center"}
                direction={"row"}
                flexWrap="wrap"
                // justifyItems={"center"}
                justifyContent={"center"}
              >
                {contractAddress &&
                  abi
                    .filter(
                      (element: AbiItem) =>
                        element.type === "function" &&
                        element.stateMutability !== "view"
                    )
                    .map((element: any, idx: any) => {
                      return (
                        <Web3MethodForm
                          w="100%"
                          key={`Web3MethodForm-${idx}`}
                          contractAddress={contractAddress}
                          m={5}
                          p={5}
                          // maxW="420px"
                          // bgColor={"green.50"}
                          boxShadow="md"
                          method={element}
                          rendered={true}
                          flexDirection="column"
                        />
                      );
                    })}
              </Flex>
            </Flex>
          </TabPanel>
          <TabPanel>
            {contractAddress &&
              abi
                .filter(
                  (element: AbiItem) =>
                    element.type === "function" &&
                    element.stateMutability === "view" &&
                    element.inputs?.length !== 0
                )
                .map((element: any, idx: any) => {
                  console.log("elment", element.name);
                  return (
                    <StateItem
                      w="100%"
                      key={`StateItem-${idx}`}
                      address={contractAddress}
                      m={5}
                      p={5}
                      // maxW="420px"
                      bgColor={"green.50"}
                      boxShadow="md"
                      abiItem={element}
                      flexDirection="column"
                    />
                  );
                })}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

const ContractInterface = chakra(_ContractInterface);

export default ContractInterface;
