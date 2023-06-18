import { chakra, Editable as _Editable } from "@chakra-ui/react";
import React, { useContext } from "react";
import { AbiItem } from "web3-utils";

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
