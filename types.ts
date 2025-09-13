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
  DEFAULT_LOGO: string;
  ENABLE_WEB3: boolean;
  COPYRIGHT_NAME: string;
  DISCORD?: string;
  TWITTER?: string;
  GITHUB?: string;
}

export interface WalletStatesInterface {
  ONBOARD: String;
  CONNECT: String;
  CONNECTED: String;
  UNKNOWN_CHAIN: String;
}

export type supportedChains = "localhost" | "mumbai" | "polygon" | "ethereum" | "goerli";

export interface ChainInterface {
  chainId: number;
  name: supportedChains;
  rpcs: Array<string>;
}

export interface TokenInterface {
  address: string;
  deadline: number;
  signed_message: string;
}

declare function ChangeChain(chainName: supportedChains): void;
declare function getChainFromId(chainId: number): supportedChains;

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
