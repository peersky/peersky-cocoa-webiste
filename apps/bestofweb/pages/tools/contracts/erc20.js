import React from "react";
const abi = require("../../../../../abi/contracts/mocks/MockERC20.sol/MockERC20.json");
import ContractInterface from "@peersky/next-web3-chakra/dist/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/dist/hooks/useRouter";
import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/AppLayout";
const Contract = () => {
  const router = useRouter();

  const { contractAddress } = router.query;
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
