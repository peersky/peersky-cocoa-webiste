import React, { useContext } from "react";
import { Web3Context } from "../providers/Web3Provider/context";
import { Web3Button } from "./Web3Button";
import { Center, Heading, Fade, Spinner } from "@chakra-ui/react";

export const RequireWeb3 = ({ children }: { children: any }) => {
  const web3ctx = useContext(Web3Context);

  if (!web3ctx.account)
    return (
      <Center flexDirection="column" pt={14}>
        <Heading size="md">This page requires web3 connection</Heading>
        <Web3Button pt={3} />
      </Center>
    );
  if (!web3ctx.provider || !web3ctx.signer) return <Spinner />;
  else return children;
};
