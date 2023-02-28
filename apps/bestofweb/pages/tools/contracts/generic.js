import React from "react";
import ContractInterface from "@peersky/next-web3-chakra/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import { getLayout } from "@peersky/next-web3-chakra/layouts/ContractLayout";
import dynamic from "next/dynamic";
import { Flex, Heading } from "@chakra-ui/react";

const UploadABI = dynamic(
  () => import("@peersky/next-web3-chakra/components/UploadAbi"),
  { ssr: false }
);

const Contract = () => {
  const [abi, setAbi] = React.useState();
  const router = useRouter();
  const { contractAddress } = router.query;
  console.log("Contract cmp", contractAddress, abi);
  if (!abi) {
    return (
      <Flex direction={"column"}>
        <Heading size="sm" as="i">
          ABI JSON please
        </Heading>
        <UploadABI onSubmit={(_abi) => setAbi(_abi)} />
      </Flex>
    );
  } else {
    return (
      <ContractInterface
        abi={abi}
        initalContractAddress={contractAddress ?? ""}
        w="100%"
      />
    );
  }
};
Contract.getLayout = getLayout;
export default Contract;
