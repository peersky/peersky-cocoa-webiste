import React, { useContext } from "react";
import { ethers } from "ethers";
import { AbiItem } from "web3-utils";
import Web3Context from "../providers/Web3Provider/context";
import { useQuery } from "react-query";

const useReadContract = <T>({
  abiItem,
  address,
  args,
  ...props
}: {
  abiItem: AbiItem;
  address: string;
  args?: string[];
}) => {
  const web3ctx = useContext(Web3Context);
  const [isEnabled, setIsEnabled] = React.useState(
    abiItem?.inputs?.length === 0 ? true : false
  );
  const getItemState = async (): Promise<T> => {
    setIsEnabled(false);
    const contract = new ethers.Contract(
      address,
      [abiItem] as any as string,
      web3ctx.provider
    );

    let response;
    if (abiItem?.inputs?.length !== 0) {
      if (!args) {
        console.error("no arguments provided");
      } else {
        response =
          abiItem.name && (await contract.functions[abiItem.name](...args));
      }
    } else {
      response = abiItem.name && (await contract.functions[abiItem.name]());
    }

    return response;
  };

  const response = useQuery(
    ["abiItemState", address, abiItem.name, args],
    getItemState,
    {
      enabled: isEnabled && !!web3ctx.account,
      retry(failureCount, error) {
        return false;
      },
      onSettled: () => {
        setIsEnabled(false);
      },
    }
  );
  return response;
};

export default useReadContract;
