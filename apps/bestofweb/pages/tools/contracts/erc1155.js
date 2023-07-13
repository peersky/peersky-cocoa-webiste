import React, { useContext } from "react";
const abi = require("../../../../../abi/contracts/mocks/MockERC1155.sol/MockERC1155.json");
import ContractInterface from "@peersky/next-web3-chakra/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import useToast from "@peersky/next-web3-chakra/hooks/useToast";
import { ethers } from "ethers";
const Contract = () => {
  const web3ctx = useContext(Web3Context);
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = React.useState("");
  const handleChange = (event) => setValue(event.target.value);
  const { contractAddress } = router.query;
  const handleSubmit = () => {
    if (value && ethers.utils.isAddress(value)) {
      router.appendQuery("contractAddress", value);
    } else {
      toast("Not an address", "error", "Not an address");
    }
  };
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
