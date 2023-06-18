import React, { useContext } from "react";
import useAppRouter from "../hooks/useRouter";
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
  Input,
  chakra,
} from "@chakra-ui/react";
import Web3Context from "../providers/Web3Provider/context";
import useToast from "../hooks/useToast";
import { ethers } from "ethers";
const ContractLayout = ({
  children,
  ...props
}: {
  children: React.ReactNode;
}) => {
  const web3ctx = useContext(Web3Context);
  const router = useAppRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = React.useState("");
  const handleChange = (event: any) => setValue(event.target.value);
  const { contractAddress } = router.query;
  const handleSubmit = () => {
    if (value && ethers.utils.isAddress(value)) {
      router.appendQuery("contractAddress", value, true, false);
    } else {
      toast("Not an address", "error", "Not an address");
    }
  };
  if (!contractAddress || !ethers.utils.isAddress(contractAddress))
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
