import React, { useEffect, useLayoutEffect, useState } from "react";
import Web3Context, { WALLET_STATES } from "./context";
import Web3 from "web3";
import {
  ChainInterface,
  GetMethodsAbiType,
  SupportedChains,
  TokenInterface,
} from "../../types";
import router from "next/router";
export const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
import { BaseContract, ContractFunction, ethers } from "ethers";
import { ExternalProvider } from "@ethersproject/providers";
import { useMutation } from "react-query";
import useToast from "../../hooks/useToast";
declare global {
  interface Window {
    ethereum: any;
    web3: Web3;
  }
}

const _askWalletProviderToChangeChain = async (
  targetChain: any,
  setChainId: any,
  provider: ethers.providers.Web3Provider | undefined
) => {
  if (targetChain?.chainId && provider) {
    try {
      await window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChain?.chainId.toString(16)}` }],
        })
        .then(
          async () =>
            await provider
              .getNetwork()
              .then((network) => setChainId(network.chainId))
        );
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `${targetChain?.chainId}`,
                chainName: targetChain?.name,
                rpcUrls: targetChain?.rpcs,
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      } else {
        throw switchError;
      }
      // handle other "switch" errors
    }
  } else {
    console.error("cannot change chain when targetChain is undefined");
  }
};
export const getMethodsABI: typeof GetMethodsAbiType = (abi, name) => {
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
  }
  else throw "accesing wrong abi element";
};

export const chains: { [key in SupportedChains]: ChainInterface } = {
  ethereum: {
    chainId: 1,
    name: "ethereum",
    rpcs: ["https://mainnet.infura.io/v3/"],
  },
  goerli: {
    chainId: 5,
    name: "goerli",
    rpcs: ["https://goerli.infura.io/v3/"],
  },
  localhost: {
    chainId: 1337,
    name: "localhost",
    rpcs: ["http://localhost:8545"],
  },
  mumbai: {
    chainId: 80001,
    name: "mumbai",
    rpcs: [
      "https://rpc-mumbai.matic.today",
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
  },
  polygon: {
    chainId: 137,
    name: "polygon",
    rpcs: [
      "https://polygon-rpc.com",
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
    ],
  },
};

const getChainFromId = (chainId: string | number) => {
  const [chainName] =
    Object.entries(chains).find(([chainName, chain]) => {
      if (chain.chainId == chainId) return true;
    }) ?? [];
  if (!chainName) throw new Error("chain id is not found");
  return chainName as any as SupportedChains;
};
const isKnownChain = (_chainId: number) => {
  return Object.keys(chains).some((key) => {
    return chains[key as any as SupportedChains].chainId == _chainId;
  });
};

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  // const [provider, setProvider] =

  const [provider, setProvider] = useState<ethers.providers.Web3Provider>(
    new ethers.providers.Web3Provider(window?.ethereum)
  );

  const [targetChain, _setChain] = React.useState<ChainInterface | undefined>(
    Object.assign({}, window?.ethereum) &&
      isKnownChain(Object.assign({}, window?.ethereum)?.networkVersion) &&
      chains[
        getChainFromId(Object.assign({}, window?.ethereum)?.networkVersion)
      ]
  );

  // web3.getDefaultProvider..transactionBlockTimeout = 100;
  // TODO: this flag should allow to read revert messages
  // However there seems to be abug in web3js, and setting this flag will upset metamsk badly..
  // issue: https://github.com/ChainSafe/web3.js/issues/4787
  // web3.eth.handleRevert = true;

  const [buttonText, setButtonText] = React.useState(
    window?.ethereum.selectedAddress
      ? WALLET_STATES.CONNECTED
      : WALLET_STATES.ONBOARD
  );
  const [account, setAccount] = React.useState<string>(
    Object.assign({}, window?.ethereum) &&
      Object.assign({}, window?.ethereum)?.selectedAddress
  );
  console.log(
    "account",
    account,
    Object.assign({}, window?.ethereum).selectedAddress
  );
  const [chainId, setChainId] = React.useState<number>(
    Object.assign({}, window?.ethereum) &&
      Object.assign({}, window?.ethereum)?.networkVersion
  );

  const changeChainFromWalletProvider = (_chainId: number) => {
    console.log("changeChainFromWalletProvider");
    const chainKey = Object.keys(chains).find((_key) => {
      const key: SupportedChains = _key as any as SupportedChains;
      return chains[key].chainId == _chainId;
    }) as any as SupportedChains | undefined;
    if (chainKey) {
      _setChain(chains[chainKey]);
      setButtonText(WALLET_STATES.CONNECTED);
    } else {
      _setChain(undefined);
      setButtonText(WALLET_STATES.UNKNOWN_CHAIN);
    }
  };

  const changeChainFromUI = (chainName: SupportedChains) => {
    if (window?.ethereum) {
      _askWalletProviderToChangeChain(
        chains[chainName],
        setChainId,
        provider
      ).then(
        () => {
          // if (chainId) {
          //   _setChain(chains[chainName]);
          //   setButtonText(WALLET_STATES.CONNECTED);
          // }
        },
        (err: any) => {
          console.error("changeChainFromUI:", err.message);
        }
      );
    }
  };

  const setWeb3ProviderAsWindowEthereum = async () => {
    console.log("setWeb3ProviderAsWindowEthereum");
    let wasSetupSuccess = false;
    provider &&
      (await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async () => {
          // setProvider(new ethers.providers.Web3Provider(window.ethereum));
          // provider;
          setProvider(new ethers.providers.Web3Provider(window?.ethereum));
          setAccount(await provider.getSigner().getAddress());
          const _chainId = window.ethereum.chainId;
          changeChainFromWalletProvider(_chainId);
          wasSetupSuccess = true;
        })
        .catch((err: any) => {
          if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            console.log("Please connect to wallet.");
          } else {
            console.error(err);
          }
        }));

    return wasSetupSuccess;
  };
  const onConnectWalletClick = async () => {
    if (window.ethereum) {
      await setWeb3ProviderAsWindowEthereum().then((result) => {
        if (result) console.log("wallet setup was successfull");
        else
          console.warn(
            "wallet setup failed, should go in fallback mode immediately"
          );
        setButtonText(result ? WALLET_STATES.CONNECTED : WALLET_STATES.CONNECT);
      });
    } else {
      router.push("https://metamask.io/download/");
    }
  };

  //when chainId, or targetChain changed -> update current account in this state
  React.useEffect(() => {
    if (
      targetChain?.chainId &&
      chainId === targetChain?.chainId &&
      window?.ethereum?.selectedAddress
    ) {
      setAccount(window.ethereum.selectedAddress);
    }
    // eslint-disable-next-line
  }, [chainId, targetChain?.chainId]);

  const handleProviderChangedChain = (_chainId: string) => {
    if (chainId) {
      setChainId(Number(_chainId));
    }
    changeChainFromWalletProvider(Number(_chainId));
  };
  const handleProviderAccountChanged = (_accounts: Array<string>) => {
    console.log("handleProviderAccountChanged");
    setAccount(_accounts[0]);
  };
  const handleDisconnect = () => {
    console.log("handleDisconnect");
    setAccount("Connect ");
    setButtonText(WALLET_STATES.CONNECT);
  };
  // On mount
  // -> start listen to chainId changed -> update current account state in this state
  // -> listen to connected -> setup state variables
  React.useLayoutEffect(() => {
    if (window?.ethereum) {
      console.log("setup listeners");
      window?.ethereum?.on("chainChanged", handleProviderChangedChain);
      window?.ethereum?.on("connect", setWeb3ProviderAsWindowEthereum);
      window?.ethereum?.on("accountsChanged", handleProviderAccountChanged);
      window?.ethereum?.on("disconnect", handleDisconnect);
    }

    return () => {
      window?.ethereum?.removeListener(
        "connect",
        setWeb3ProviderAsWindowEthereum
      );
      window?.ethereum?.removeListener(
        "chainChanged",
        handleProviderChangedChain
      );
      window?.ethereum?.removeListener(
        "accountsChanged",
        handleProviderAccountChanged
      );
      window?.ethereum?.removeListener("disconnect", handleDisconnect);
    };
    //eslint-disable-next-line
  }, []);

  // When chainId or web3 or targetChain changes -> update button state
  React.useLayoutEffect(() => {
    if (account) {
      setButtonText(WALLET_STATES.CONNECTED);
    } else {
      if (!window.ethereum) {
        setButtonText(WALLET_STATES.ONBOARD);
      } else {
        setButtonText(WALLET_STATES.CONNECT);
      }
    }
  }, [chainId, targetChain, account]);

  // onMount check if there is provided address by provider already, if yes - set it in this state and provide to web3
  // As well as try to look up for chainId in list of supported chains
  React.useLayoutEffect(() => {
    console.log(
      "window?.ethereum?.selectedAddress",
      window?.ethereum?.selectedAddress
    );
    if (window.ethereum) {
      if (window?.ethereum?.selectedAddress) {
        setButtonText(WALLET_STATES.CONNECTED);
        setWeb3ProviderAsWindowEthereum().then((result) => {
          if (result) {
            window?.ethereum
              ?.request({ method: "eth_chainId" })
              .then((_chainId: any) => {
                changeChainFromWalletProvider(parseInt(_chainId, 16));
              });
          } else
            console.warn(
              "provider setup failed, should go in fallback mode immediately"
            );

          console.log(
            "sertting button to ",
            result ? WALLET_STATES.CONNECTED : WALLET_STATES.CONNECT
          );
        });
        //  ÷
      } else {
        setButtonText(WALLET_STATES.CONNECT);
      }
    } else {
      setButtonText(WALLET_STATES.ONBOARD);
    }
    //eslint-disable-next-line
  }, []);

  // const call =
  //   ({ contractAddress, method }: { contractAddress: string; method: any }) =>
  //   async ({ args }: { args: any }) => {
  //     const contract = new ethers.Contract(
  //       contractAddress,
  //       [method] as any as string,
  //       provider.getSigner()
  //     );

  //     let response;
  //     if (method.name) {
  //       console.log("sending tx");
  //       response = await contract.functions[method.name](...args);
  //     } else {
  //       // console.error("method.name not provided");
  //       throw new Error("no method name");
  //     }
  //     return response;
  //   };
  // const toast = useToast();

  // const tx = ({
  //   contract,
  //   method,
  //   onSuccess,
  // }: {
  //   contract: ethers.Contract;
  //   onSuccess?: (resp: any) => void;
  // }) => { const contract  = new ethers.Contract(contractAddress,interface, provider)
  //   useMutation(
  //     ({ args }: { args: any }) => contract.functions[method]({ args }),
  //     {
  //       onSuccess: (resp) => {
  //         toast("Transaction went to the moon!", "success");
  //         onSuccess && onSuccess(resp);
  //       },
  //       onError: () => {
  //         toast("Transaction failed >.<", "error");
  //       },
  //     }}
  //   );

  return (
    <Web3Context.Provider
      value={{
        provider,
        onConnectWalletClick,
        buttonText,
        WALLET_STATES,
        account: account,
        chainId,
        // defaultTxConfig,
        getMethodsABI,
        changeChain: changeChainFromUI,
        targetChain,
        getChainFromId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export class ReactiveContract extends BaseContract {
  // The meta-class properties
  readonly [key: string]: typeof useMutation<ContractFunction> | any;
}

export default Web3Provider;
