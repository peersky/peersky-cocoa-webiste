import Web3 from "web3/types";
import { AbiItem } from "web3-utils";

export interface WalletStatesInterface {
  ONBOARD: String;
  CONNECT: String;
  CONNECTED: String;
  UNKNOWN_CHAIN: String;
}

export type supportedChains = "localhost" | "mumbai" | "polygon" | "ethereum";

export interface ChainInterface {
  chainId: number;
  name: supportedChains;
  rpcs: Array<string>;
}

export declare function GetMethodsAbiType<T>(
  abi: AbiItem[],
  name: keyof T
): AbiItem;

export interface TokenInterface {
  address: string;
  deadline: number;
  signed_message: string;
}

declare function ChangeChain(chainName: supportedChains): void;
declare function getChainFromId(chainId: number): supportedChains;
export interface Web3ProviderInterface {
  web3: Web3;
  onConnectWalletClick: Function;
  buttonText: String;
  WALLET_STATES: WalletStatesInterface;
  account: string;
  chainId: number;
  defaultTxConfig: Object;
  // signAccessToken: Function;
  getMethodsABI: typeof GetMethodsAbiType;
  changeChain: typeof ChangeChain;
  targetChain: ChainInterface | undefined;
  getChainFromId: typeof getChainFromId;
}

export interface UIProviderInterface {
  sidebarVisible: boolean | undefined;
  searchBarActive: boolean | undefined;
  isMobileView: boolean | undefined;
  sidebarCollapsed: boolean | undefined;
  sidebarToggled: boolean | undefined;
  searchTerm: string | undefined;
  setSearchBarActive: Function;
  setSidebarCollapsed: Function;
  setSearchTerm: Function;
  setSidebarToggled: Function;
  setSidebarVisible: Function;
  sessionId: string | undefined;
}
