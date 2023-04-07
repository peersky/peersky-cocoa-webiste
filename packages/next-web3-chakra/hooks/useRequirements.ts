import { getContract } from "@daocoacoa/bestofgame-js";
import { BigNumberish } from "ethers";
import { useQuery } from "react-query";
import { Web3ProviderInterface } from "../types";
import queryCacheProps from "./hookCommon";
// enum ContractTypes {
//   ERC20,
//   ERC1155,
//   ERC721,
// }
export interface useRequirementsArguments {
  gameId: string;
  web3ctx: Web3ProviderInterface;
  reqId: BigNumberish;
  reqAddress: string;
  contractType: BigNumberish;
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
      "BestOfWebContract",
      "requirement",
      {
        chainId: web3ctx.chainId,
        gameId,
        reqId,
        reqAddress,
      },
    ],
    () =>
      contract.getJoinRequirementsByToken(
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
  return { contractRequirement };
};
