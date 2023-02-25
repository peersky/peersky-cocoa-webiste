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
import useAppRouter from "../hooks/useRouter";
import useToast from "../hooks/useToast";
import Web3Context from "../providers/Web3Provider/context";
import Web3MethodForm from "./Web3MethodForm";
import { useQuery } from "@chakra-ui/react";

const _ContractGenericState = ({
  abi,
  initalContractAddress,
  ...props
}: {
  abi: AbiItem[];
  initalContractAddress?: string;
}) => {
  return <></>;
};

const ContractGenericState = chakra(_ContractGenericState);
export default ContractGenericState;
