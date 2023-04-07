import { useMutation, useQuery } from "react-query";
import {
  getContractState,
  getGameState,
  getPlayersGame,
  getRankTokenURI,
  getArtifact,
  getContract,
} from "@daocoacoa/bestofgame-js";
import * as BestMethods from "@daocoacoa/bestofgame-js";
import useToast from "./useToast";
import queryCacheProps from "./hookCommon";
import { Web3ProviderInterface } from "../types";
import { BigNumberish, BytesLike, ethers } from "ethers";
import { LibCoinVending } from "../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
import ERC20Abi from "../../../abi/contracts/mocks/MockERC20.sol/MockERC20.json";
import ERC1155Abi from "../../../abi/contracts/mocks/MockERC1155.sol/MockERC1155.json";
import ERC721Abi from "../../../abi/contracts/mocks/MockERC721.sol/MockERC721.json";
import { MockERC20, MockERC1155, MockERC721 } from "../../../types/typechain";
export interface BestOfWebContractArguments {
  tokenId?: string;
  gameId?: string;
  web3ctx: Web3ProviderInterface;
}
enum ContractTypes {
  ERC20,
  ERC1155,
  ERC721,
}

export const useBestOfWebContract = ({
  tokenId,
  gameId,
  web3ctx,
}: BestOfWebContractArguments) => {
  const chainName = web3ctx.getChainFromId(web3ctx.chainId);
  const toast = useToast();
  const contractState = useQuery(
    ["BestOfWebContract", "state", { chainId: web3ctx.chainId }],
    () => getContractState(chainName, web3ctx.provider as any),
    {
      ...queryCacheProps,
      retry: (failureCount, error: any) => {
        if (error.message) return false;
        return true;
      },
      onSuccess: (e) => {},
      enabled: !!web3ctx.account && !!web3ctx.chainId && !!web3ctx.provider,
      onError: (e: any) => {
        if (!e.message.includes("underlying network changed"))
          toast(e.message, "error", ":(");
      },
      // useErrorBoundary: true,
    }
  );

  const rankTokenURI = useQuery(
    ["BestOfWebContract", "rankToken", "uri", { chainId: web3ctx.chainId }],
    () => getRankTokenURI(chainName, web3ctx.provider as any),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
        contractState.isSuccess &&
        !!web3ctx.provider,
      onError: (e) => console.error(e),
    }
  );

  const rankTokenBalance = useQuery(
    [
      "BestOfWebContract",
      "rankToken",
      "balance",
      { chainId: web3ctx.chainId, tokenId: tokenId },
    ],
    () => getRankTokenURI(chainName, web3ctx.provider as any),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
        !!web3ctx.provider &&
        !!tokenId &&
        contractState.isSuccess,
      onError: (e) => console.error(e),
    }
  );

  const gameState = useQuery(
    [
      "BestOfWebContract",
      "gameState",
      { chainId: web3ctx.chainId, gameId: gameId },
    ],
    () => getGameState(chainName, web3ctx.provider as any, gameId ?? "0"),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
        !!web3ctx.provider &&
        !!gameId &&
        contractState.isSuccess,
      onError: (e) => console.error(e),
    }
  );

  const playersGame = useQuery(
    [
      "BestOfWebContract",
      "playersGame",
      { chainId: web3ctx.chainId, player: web3ctx.account },
    ],
    () => getPlayersGame(chainName, web3ctx.provider as any, gameId ?? "0"),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
        !!gameId &&
        !!web3ctx.provider &&
        contractState.isSuccess,
      onError: (e) => console.error(e),
    }
  );

  const commonProps = {
    onSuccess: () => {
      toast("Successfully updated contract", "success");
      contractState.refetch();
    },
    onError: () => {
      toast("Something went wrong", "error");
    },
  };

  // const setURI = useMutation(
  //   ({ uri }: { uri: string }) =>
  //     terminusFacet.methods.setContractURI(uri).send({ from: ctx.account }),
  //   { ...commonProps }
  // );

  const startGame = useMutation(
    (gameId: string) =>
      BestMethods.startGame(chainName, web3ctx.provider as any)(gameId),
    { ...commonProps }
  );

  const cancelGame = useMutation(
    (gameId: string) =>
      BestMethods.cancelGame(chainName, web3ctx.provider as any)(gameId),
    { ...commonProps }
  );

  const checkSignature = useMutation(
    ({
      message,
      signature,
      account,
    }: {
      message: BytesLike;
      signature: BytesLike;
      account: string;
    }) =>
      BestMethods.checkSignature(chainName, web3ctx.provider as any)(
        message,
        signature,
        account
      ),
    { ...commonProps }
  );

  const endTurn = useMutation(
    ({
      gameId,
      turnSalt,
      voters,
      votersRevealed,
    }: {
      gameId: string;
      turnSalt: BytesLike;
      voters: string[];
      votersRevealed: [string, string, string][];
    }) =>
      BestMethods.endTurn(chainName, web3ctx.provider as any)(
        gameId,
        turnSalt,
        voters,
        votersRevealed
      ),
    { ...commonProps }
  );

  const leaveGame = useMutation(
    (gameId: string) =>
      BestMethods.leaveGame(chainName, web3ctx.provider as any)(gameId),
    { ...commonProps }
  );

  const openRegistration = useMutation(
    (gameId: string) =>
      BestMethods.openRegistration(chainName, web3ctx.provider as any)(gameId),
    { ...commonProps }
  );

  const submitProposal = useMutation(
    ({
      gameId,
      proposerHidden,
      proof,
      proposal,
    }: {
      gameId: string;
      proposerHidden: BytesLike;
      proof: BytesLike;
      proposal: string;
    }) =>
      BestMethods.submitProposal(chainName, web3ctx.provider as any)(
        gameId,
        proposerHidden,
        proof,
        proposal
      ),
    { ...commonProps }
  );

  const submitVote = useMutation(
    ({
      gameId,
      votesHidden,
      proof,
      signature,
    }: {
      gameId: string;
      votesHidden: [BytesLike, BytesLike, BytesLike];
      proof: BytesLike;
      signature: BytesLike;
    }) =>
      BestMethods.submitVote(chainName, web3ctx.provider as any)(
        gameId,
        votesHidden,
        proof,
        signature
      ),
    { ...commonProps }
  );

  const createGame = useMutation(
    ({
      gameMaster,
      gameRank,
      gameId,
    }: {
      gameMaster: string;
      gameRank: string;
      gameId?: BigNumberish;
    }) =>
      BestMethods.createGame(chainName, web3ctx.provider as any)(
        gameMaster,
        gameRank,
        gameId
      ),
    { ...commonProps }
  );

  const setJoinRequirements = useMutation(
    ({
      gameId,
      config,
    }: {
      gameId: string;
      config: LibCoinVending.ConfigPositionStruct;
    }) =>
      BestMethods.setJoinRequirements(chainName, web3ctx.provider as any)(
        gameId,
        config
      ),
    { ...commonProps }
  );

  const approveAllRequirements = async (gameId: string) => {
    const contract = getContract(chainName, web3ctx.provider as any);
    const reqs = await contract.getJoinRequirements(gameId);
    const values = reqs.ethValues;

    const value = values.bet.add(values.burn).add(values.pay);
    console.log("value.toString()", value.toString());

    reqs.conctractAddresses.forEach(async (address, idx) => {
      const type = reqs.contractTypes[idx];
      const id = reqs.contractIds[idx];
      const values = await contract.getJoinRequirementsByToken(
        gameId,
        address,
        id,
        type
      );
      const totalAllowanceRequired = values.bet.amount
        .add(values.pay.amount)
        .add(values.lock.amount)
        .add(values.burn.amount);
      const toalBalanceNeeded = totalAllowanceRequired.add(values.have.amount);
      if (type == ContractTypes.ERC20) {
        const erc20Contract = new ethers.Contract(
          address,
          ERC20Abi,
          web3ctx.provider
        ) as MockERC20;
        const allowance = await erc20Contract["allowance"](
          web3ctx.account,
          contract.address
        );
        if (allowance.lt(totalAllowanceRequired)) {
          await erc20Contract.increaseAllowance(
            contract.address,
            totalAllowanceRequired.sub(allowance)
          );
        }
      } else if (type == ContractTypes.ERC1155) {
        const ac = ethers.utils.getAddress(address);
        console.log("is ERC1155", address, contract.address, ac);
        const erc1155Contract = new ethers.Contract(
          address,
          ERC1155Abi,
          web3ctx.provider?.getSigner()
        ) as MockERC1155;

        const isApproved = await erc1155Contract.isApprovedForAll(
          web3ctx.account,
          contract.address
        );
        console.log("is Approved check", isApproved);
        if (!isApproved) {
          await erc1155Contract.setApprovalForAll(contract.address, true);
        }
      } else {
        const erc721Contract = new ethers.Contract(
          address,
          ERC721Abi,
          web3ctx.provider
        ) as MockERC721;
        const isApproved = await erc721Contract.isApprovedForAll(
          web3ctx.account,
          contract.address
        );
        if (!isApproved) {
          await erc721Contract.setApprovalForAll(contract.address, true);
        }
      }
    });
  };

  const approveAll = useMutation(
    (gameId: string) => approveAllRequirements(gameId),
    { ...commonProps }
  );
  const joinGame = useMutation(
    (gameId: string) =>
      BestMethods.joinGame(chainName, web3ctx.provider as any)(gameId),
    { ...commonProps }
  );

  // const poolURI = useURI({ link: poolState.data?.uri });
  // const contractJSON = useURI({ link: contractState.data?.contractURI });

  return {
    contractState,
    rankTokenURI,
    rankTokenBalance,
    gameState,
    playersGame,
    startGame,
    cancelGame,
    checkSignature,
    endTurn,
    leaveGame,
    openRegistration,
    submitProposal,
    submitVote,
    createGame,
    setJoinRequirements,
    getContract: BestMethods.getContract,
    getArtifact,
    joinGame,
    approveAll,
  };
};

export default useBestOfWebContract;
