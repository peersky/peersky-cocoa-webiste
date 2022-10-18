import React, { useContext } from "react";
import ContractInterface from "@peersky/next-web3-chakra/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import { getLayout as getSiteLayout } from "./AppLayout";
import {
  Modal,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  ModalCloseButton,
  Input,
  chakra,
} from "@chakra-ui/react";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import useToast from "@peersky/next-web3-chakra/hooks/useToast";
const ContractLayout = ({ children, ...props }: { children: any }) => {
  const web3ctx = useContext(Web3Context);
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = React.useState("");
  const handleChange = (event: any) => setValue(event.target.value);
  const { contractAddress } = router.query;
  const handleSubmit = () => {
    if (value && web3ctx.web3.utils.isAddress(value)) {
      router.appendQuery("contractAddress", value, true, false);
    } else {
      toast("Not an address", "error", "Not an address");
    }
  };
  console.log("children", children);
  if (!contractAddress || !web3ctx.web3.utils.isAddress(contractAddress))
    return (
      <Modal isOpen={true} onClose={() => {}}>
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
    );
  return <>{children}</>;
};

const CL = chakra(ContractLayout);
export const getLayout = (page: any) => getSiteLayout(<CL>{page}</CL>);

export default ContractLayout;
