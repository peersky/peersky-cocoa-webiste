import React from "react";
const abi = require("../../../../../abi/contracts/mocks/MockERC20.sol/MockERC20.json");
import ContractInterface from "@peersky/next-web3-chakra/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
const Contract = () => {
  const router = useRouter();

  const { contractAddress } = router.query;
  console.log("contractAddress", contractAddress);
  return (
    <ContractInterface
      abi={abi}
      initalContractAddress={contractAddress ?? ""}
      w="100%"
    />
  );
};
Contract.getLayout = getLayout;
export default Contract;
