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
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AbiItem } from "web3-utils";
import useRouter from "../hooks/useRouter";
import useToast from "../hooks/useToast";
import Web3Context from "../providers/Web3Provider/context";
import StateItem from "./StateItem";
import Web3MethodForm from "./Web3MethodForm";

const _ContractInterface = ({
  abi,
  initalContractAddress,
  ...props
}: {
  abi: AbiItem[];
  initalContractAddress?: string;
}) => {
  console.log("render contract interface", initalContractAddress);
  const toast = useToast();
  const [contractAddress, setContractAddress] = React.useState(
    initalContractAddress
  );
  const { web3 } = useContext(Web3Context);
  const router = useRouter();

  return (
    <Flex direction={"column"}>
      <_Editable
        bgColor={"blue.200"}
        size="sm"
        fontSize={"sm"}
        textColor="gray.900"
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
      </_Editable>
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
                      bgColor={"green.50"}
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
                          bgColor={"green.50"}
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
