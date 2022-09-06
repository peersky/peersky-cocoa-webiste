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
  ONBOARD: "Install MetaMask!",
  CONNECT: "Connect with Metamask",
  CONNECTED: "Connected",
  UNKNOWN_CHAIN: "Unsupported chain",
};

const Web3Context = createContext<Web3ProviderInterface>({
  web3: new Web3(null),
  onConnectWalletClick: () => console.error("not intied"),
  buttonText: "",
  WALLET_STATES: WALLET_STATES,
  account: "",
  chainId: 0,
  defaultTxConfig: {},
  getMethodsABI: (abi, name) => {
    const index = abi.findIndex(
      (item) => item.name === name && item.type == "function"
    );
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
