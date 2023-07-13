import { ethers } from "ethers";
import { createContext } from "react";
import Web3 from "web3";
import { WalletStatesInterface, Web3ProviderInterface } from "../../types";

export enum txStatus {
  READY = 0,
  SUCCESS,
  ERROR,
  LOADING,
}

export interface web3MethodCall {
  status: txStatus;
  send: (...args: Array<any>) => void;
  data: any;
}

export const WALLET_STATES: WalletStatesInterface = {
  ONBOARD: "Get a wallet",
  CONNECT: "Login with Web3",
  CONNECTED: "Connected",
  UNKNOWN_CHAIN: "Unsupported chain",
};

const Web3Context = createContext<Web3ProviderInterface>({
  provider: {} as any as ethers.providers.Web3Provider,
  signer: {} as any as ethers.providers.JsonRpcSigner,
  onConnectWalletClick: () => console.error("not intied"),
  buttonText: "",
  WALLET_STATES: WALLET_STATES,
  account: "",
  chainId: 0,
  getMethodsABI: (abi, name) => {
    const split = name.toString().split("(");
    const index = abi.findIndex((item) => {
      if (item.name === split[0] && item.type == "function") {
        if (split.length == 1) {
          return item.name === split[0] ? true : false;
        } else {
          const itemArguments = item.inputs;
          const NameArgs = split[1].slice(0, -1);
          const types = NameArgs.split(",");
          let isAMatch = false;
          if (itemArguments?.length == types.length) {
            isAMatch = true;
            itemArguments.forEach((itemArg, idx) => {
              if (itemArg.type !== types[idx]) {
                isAMatch = false;
              }
            });
          }
          return isAMatch;
        }
      } else return false;
    });
    if (index !== -1) {
      const item = abi[index];
      return item;
    } else throw "accesing wrong abi element";
  },
  changeChain: () => {
    console.error("not intied");
  },
  targetChain: undefined,
  getChainFromId: () => {
    console.error("not intied");
    return "ethereum";
  },
});

export default Web3Context;
