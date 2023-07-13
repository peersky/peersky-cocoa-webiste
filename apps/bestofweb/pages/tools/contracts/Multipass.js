import React from "react";
import ContractInterface from "@peersky/next-web3-chakra/dist/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/dist/hooks/useRouter";
import { getLayout } from "@peersky/next-web3-chakra/dist/layouts/AppLayout";
// import {
//   Modal,
//   Button,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   Input,
// } from "@chakra-ui/react";
import useToast from "@peersky/next-web3-chakra/dist/hooks/useToast";
import { ethers } from "ethers";
const Contract = () => {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = React.useState("");
  const handleChange = (event) => setValue(event.target.value);
  const { contractAddress, chainId } = router.query;
  const handleSubmit = () => {
    if (value && ethers.utils.getAddress(value)) {
      router.appendQuery("contractAddress", value);
    } else {
      toast("Not an address", "error", "Not an address");
    }
  };
  // if (!contractAddress || !web3ctx.provider.utils.isAddress(contractAddress))
  //   return (
  //     <>
  //       <Modal isOpen={true}>
  //         <ModalOverlay />
  //         <ModalContent>
  //           <ModalHeader>Please set contract address</ModalHeader>
  //           <ModalBody>
  //             <Input
  //               value={value}
  //               onChange={handleChange}
  //               variant="outline"
  //               placeholder="0x.."
  //             ></Input>
  //           </ModalBody>

  //           <ModalFooter>
  //             <Button variant="ghost" onClick={() => handleSubmit()}>
  //               Submit
  //             </Button>
  //           </ModalFooter>
  //         </ModalContent>
  //       </Modal>
  //     </>
  //   );
  return (
    <ContractInterface
      abi={require("../../../../../deployments/mumbai/Multipass.json").abi}
      initalContractAddress={contractAddress ?? ""}
      initialChainId={chainId}
      autoCompleteList={[
        {
          address: ethers.utils.getAddress(
            require("../../../../../deployments/mumbai/Multipass.json").address
          ),
          network: "mumbai",
        },
      ]}
      w="100%"
    />
  );
};
Contract.getLayout = getLayout;
export default Contract;
