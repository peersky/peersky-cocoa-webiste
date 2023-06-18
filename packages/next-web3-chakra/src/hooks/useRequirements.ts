import { getContract } from "@daocoacoa/bestofgame-js";
import { BigNumberish, ethers } from "ethers";
import { useQuery } from "react-query";
import { MockERC1155, MockERC20, MockERC721 } from "../types/typechain";
import { Web3ProviderInterface } from "../types";
import queryCacheProps from "./hookCommon";
enum ContractTypes {
  ERC20,
  ERC1155,
  ERC721,
}
export interface useRequirementsArguments {
  gameId: string;
  web3ctx: Web3ProviderInterface;
  reqId: BigNumberish;
  reqAddress: string;
  contractType: BigNumberish;
  onInsufficient: () => void;
}

export const useRequirements = ({
  gameId,
  web3ctx,
  reqId,
  reqAddress,
  contractType,
}: useRequirementsArguments) => {
  const chainName = web3ctx.getChainFromId(web3ctx.chainId);
  const contract = getContract(chainName, web3ctx.provider as any);
  const contractRequirement = useQuery(
    [
      "requirement",
      {
        chainId: web3ctx.chainId,
        gameId,
        reqId,
        reqAddress,
      },
    ],
    async () =>
      await contract.getJoinRequirementsByToken(
        gameId,
        reqAddress,
        reqId,
        contractType
      ),
    {
      ...queryCacheProps,
      enabled: !!web3ctx.account && !!web3ctx.chainId && !!web3ctx.provider,
      onError: (e) => console.error(e),
    }
  );

  const requiredBalance = useQuery(
    [
      "BestOfWebContract",
      "requiredBalance",
      {
        chainId: web3ctx.chainId,
        gameId,
        reqId,
        reqAddress,
      },
    ],
    async () => {
      let contract;
      let balance;
      switch (contractType.toString()) {
        case ContractTypes.ERC20.toString():
          contract = new ethers.Contract(
            reqAddress,
            require("../../../abi/contracts/mocks/MockERC20.sol/MockERC20.json"),
            web3ctx.provider
          ) as MockERC20;
          balance = await contract.balanceOf(web3ctx.account);
          break;
        case ContractTypes.ERC1155.toString():
          contract = new ethers.Contract(
            reqAddress,
            require("../../../abi/contracts/mocks/MockERC1155.sol/MockERC1155.json"),
            web3ctx.provider
          ) as MockERC1155;
          balance = await contract.balanceOf(web3ctx.account, reqId);
          break;
        case ContractTypes.ERC721.toString():
          contract = new ethers.Contract(
            reqAddress,
            require("../../../abi/contracts/mocks/MockERC721.sol/MockERC721.json"),
            web3ctx.provider
          ) as MockERC721;
          balance = await contract.balanceOf(web3ctx.account);
          break;
        default:
          throw new Error("unhandled contract type");
      }
      console.log("balance", balance.toString());
      const isEnough = contractRequirement.data?.have.amount
        .add(contractRequirement.data.lock.amount)
        .add(contractRequirement.data.bet.amount)
        .add(contractRequirement.data.burn.amount)
        .add(contractRequirement.data.pay.amount)
        .lte(balance);
      return { balance, isEnough };
    },
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
        !!web3ctx.provider &&
        !!contractRequirement.data,
      onError: (e) => console.error(e),
    }
  );

  return { contractRequirement, requiredBalance };
};
