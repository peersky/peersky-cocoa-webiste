import React, { useContext } from "react";
const abi = require("../../../../../abi/contracts/mocks/MockERC1155.sol/MockERC1155.json");
import ContractInterface from "@peersky/next-web3-chakra/dist/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/dist/hooks/useRouter";
import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/AppLayout";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
} from "@chakra-ui/react";
import Web3Context from "@peersky/next-web3-chakra/dist/providers/Web3Provider/context";
import useToast from "@peersky/next-web3-chakra/dist/hooks/useToast";
const Contract = () => {
  const web3ctx = useContext(Web3Context);
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = React.useState("");
  const handleChange = (event) => setValue(event.target.value);
  const { contractAddress } = router.query;
  const handleSubmit = () => {
    if (value && web3ctx.provider.utils.isAddress(value)) {
      router.appendQuery("contractAddress", value);
    } else {
      toast("Not an address", "error", "Not an address");
    }
  };
  if (!contractAddress || !web3ctx.provider.utils.isAddress(contractAddress))
    return (
      <>
        <Modal isOpen={true}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Please set contract address</ModalHeader>
            <ModalBody>
              <Input
                value={value}
                onChange={handleChange}
                variant="outline"
                placeholder="0x.."
              ></Input>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={() => handleSubmit()}>
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
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
