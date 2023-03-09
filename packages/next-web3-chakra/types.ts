import Web3 from "web3/types";
import { AbiItem, AbiInput } from "web3-utils";
import { ethers } from "ethers";
export type { SupportedChains } from "../../types";
import { SupportedChains } from "./types";

export enum SiteMapItemType {
  EMPTY = 0,
  CONTENT,
  EXTERNAL,
  FOOTER_CATEGORY,
}
export interface SiteMapItem {
  title: string;
  path: string;
  type: SiteMapItemType;
  children?: SiteMapItem[];
}

export type SiteMap = SiteMapItem[];
export interface WebSiteConfig {
  SITEMAP: SiteMap;
}

export interface WalletStatesInterface {
  ONBOARD: String;
  CONNECT: String;
  CONNECTED: String;
  UNKNOWN_CHAIN: String;
}

export interface ChainInterface {
  chainId: number;
  name: SupportedChains;
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

declare function ChangeChain(chainName: SupportedChains): void;
declare function getChainFromId(chainId: number): SupportedChains;
export interface Web3ProviderInterface {
  provider: ethers.providers.Web3Provider;
  onConnectWalletClick: Function;
  buttonText: String;
  WALLET_STATES: WalletStatesInterface;
  account: string;
  chainId: number;
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
  webSiteConfig: WebSiteConfig;
}

export interface ArgumentField {
  placeholder?: string;
  initialValue?: string;
  label?: string;
  valueIsEther?: boolean;
  convertToBytes: boolean;
  // hide: boolean;
}
export interface ArgumentFields {
  [Key: string]: ArgumentField;
}

export interface Web3InpuUIField {
  value: string;
  placeholder: string;
  hide: boolean;
  label: string;
  valueIsEther?: boolean;
  convertToBytes: boolean;
  initialValue: string;
}
export interface ExtendedInputs extends Omit<AbiInput, "components"> {
  components?: ExtendedInputs[];
  meta: Web3InpuUIField;
}

export interface StateInterface extends Omit<AbiItem, "inputs"> {
  inputs: Array<ExtendedInputs>;
}
