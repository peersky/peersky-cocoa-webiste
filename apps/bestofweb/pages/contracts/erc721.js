import React, { useContext } from "react";
const _abi = require("../../../../abi/contracts/mocks/MockERC721.sol");
import ContractInterface from "@peersky/next-web3-chakra/components/ContractInteface";
import useRouter from "@peersky/next-web3-chakra/hooks/useRouter";
import { getLayout } from "@peersky/next-web3-chakra/layouts/AppLayout";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import { useQuery } from "react-query";

const Contract = () => {
  const router = useRouter();

  const abi = [
    ..._abi,
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "newBaseURI",
          type: "string",
        },
      ],
      name: "setBaseUri",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

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
