import { useMutation, useQuery } from "react-query";
import {
  getContractState,
  getGameState,
  getPlayersGame,
  getRankTokenURI,
  getArtifact,
} from "@daocoacoa/bestofgame-js";
import * as BestMethods from "@daocoacoa/bestofgame-js";
import useToast from "./useToast";
import queryCacheProps from "./hookCommon";
import { Web3ProviderInterface } from "../types";
import { BytesLike, ethers } from "ethers";
import { LibCoinVending } from "../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
export interface BestOfWebContractArguments {
  tokenId?: string;
  gameId?: string;
  web3ctx: Web3ProviderInterface;
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
    () => getContractState(chainName, web3ctx.provider),
    {
      ...queryCacheProps,
      retry: (failureCount, error: any) => {
        if (error.message) return false;
        return true;
      },
      onSuccess: (e) => {
        console.log("eeee", e);
      },
      enabled: !!web3ctx.account && !!web3ctx.chainId,
      onError: (e: any) => {
        if (!e.message.includes("underlying network changed"))
          toast(e.message, "error", ":(");
      },
      // useErrorBoundary: true,
    }
  );

  const rankTokenURI = useQuery(
    ["BestOfWebContract", "rankToken", "uri", { chainId: web3ctx.chainId }],
    () => getRankTokenURI(chainName, web3ctx.provider),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account && !!web3ctx.chainId && contractState.isSuccess,
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
    () => getRankTokenURI(chainName, web3ctx.provider),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
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
    () => getGameState(chainName, web3ctx.provider, gameId ?? "0"),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
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
    () => getPlayersGame(chainName, web3ctx.provider, gameId ?? "0"),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
        !!gameId &&
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
      BestMethods.startGame(chainName, web3ctx.provider)(gameId),
    { ...commonProps }
  );

  const cancelGame = useMutation(
    (gameId: string) =>
      BestMethods.cancelGame(chainName, web3ctx.provider)(gameId),
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
      BestMethods.checkSignature(chainName, web3ctx.provider)(
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
      BestMethods.endTurn(chainName, web3ctx.provider)(
        gameId,
        turnSalt,
        voters,
        votersRevealed
      ),
    { ...commonProps }
  );

  const leaveGame = useMutation(
    (gameId: string) =>
      BestMethods.leaveGame(chainName, web3ctx.provider)(gameId),
    { ...commonProps }
  );

  const openRegistration = useMutation(
    (gameId: string) =>
      BestMethods.openRegistration(chainName, web3ctx.provider)(gameId),
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
      BestMethods.submitProposal(chainName, web3ctx.provider)(
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
      BestMethods.submitVote(chainName, web3ctx.provider)(
        gameId,
        votesHidden,
        proof,
        signature
      ),
    { ...commonProps }
  );

  const createGame = useMutation(
    ({ gameMaster, gameRank }: { gameMaster: string; gameRank: string }) =>
      BestMethods.createGame(chainName, web3ctx.provider)(gameMaster, gameRank),
    { ...commonProps }
  );

  const setJoinRequirements = useMutation(
    ({
      gameMaster,
      config,
    }: {
      gameMaster: string;
      config: LibCoinVending.ConfigPositionStruct;
    }) =>
      BestMethods.setJoinRequirements(chainName, web3ctx.provider)(
        gameMaster,
        config
      ),
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
  };
};

export default useBestOfWebContract;
