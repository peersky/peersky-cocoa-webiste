## Web3 react components for Chakra on Next

React(18) components for chakra(2) using next(13).

This is a website building bricks package such as navbar, footer, cards, layouts etc.

It is intended to be used for Web3 specific projects - grants you a web3 provider interface, chain selector drop down, and allows to build generic smart contract interface by just pointing address and ABI. How cool is that?


### Use case

https://peersky.github.io/daococoa/

### How to use

#### Getting started

Install `yarn add @peersky/next-web3-chakra`

Create `config.ts` that has exports SITEMAP:

```
import { SiteMap, SiteMapItemType } from "@peersky/next-web3-chakra/types";
export const SITEMAP: SiteMap = [
  {
    title: "Blog",
    path: "/blog",
    type: SiteMapItemType.CONTENT,
  }]
```

create your theme. Here is how you start with default theme:

```jsx
import { default as defaultTheme } from "@peersky/next-web3-chakra/theme/";

import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  ...defaultTheme,
  //Here can override library theme items
});

export default theme;
```

Wrap your application:

```jsx
import { UIProvider, Web3Provider } from "@peersky/next-web3-chakra/providers";
import { SITEMAP } from "./config";
import theme from "./theme";
....
 <ChakraProvider theme={theme}>
      {/* <Fonts /> */}
      <Web3Provider>
        <UIProvider config={{ SITEMAP: SITEMAP }}>{props.children}</UIProvider>
      </Web3Provider>
</ChakraProvider>
```

#### Layouts

This package does not use next13 layouts. Instead old fashioned way is preserved. Use as follows to ensure items defined in layouts do not rerender when you switch between pages:

```js
import { getLayout } from "@peersky/next-web3-chakra/layouts/BlogLayout";
const Blog = <div>lorem<div>
Blog.getLayout = getLayout();
export default Blog;
```

#### Components

Import from `@peersky/next-web3-chakra/components` see inside repository for more details

#### Providers

Import from `@peersky/next-web3-chakra/providers`

UI Provider gives you general information about state of UI:

```ts
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
```

Web3 Provider gives a convinient access to blockchain related operations:

```ts
export interface Web3ProviderInterface {
  web3: Web3; //web3js
  onConnectWalletClick: Function;
  buttonText: String;
  WALLET_STATES: WalletStatesInterface; //onboard/conect/connected/unknown-chain
  account: string; //address
  chainId: number;
  defaultTxConfig: Object;
  // signAccessToken: Function;
  getMethodsABI: typeof GetMethodsAbiType; //Takes contract ABI and returns method with given name
  changeChain: typeof ChangeChain; //Request wallet to switch chain
  targetChain: ChainInterface | undefined; //Desired chain
  getChainFromId: typeof getChainFromId; //Read chain name from chain id
}
```

### Why there is no <you_name_it>

Author works on this package for pure enthusiasm. If you want to contribute or request a feature: please contact on github:
https://github.com/peersky/daococoa/issues

### Fund

You can fund this project to make it more fun.
