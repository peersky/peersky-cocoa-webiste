import { useMutation, useQuery, useQueryClient } from "react-query";
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
import { LibCoinVending } from "../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
import ERC20Abi from "../abi/contracts/mocks/MockERC20.sol/MockERC20.json";
import ERC1155Abi from "../abi/contracts/mocks/MockERC1155.sol/MockERC1155.json";
import ERC721Abi from "../abi/contracts/mocks/MockERC721.sol/MockERC721.json";
import { MockERC20, MockERC1155, MockERC721 } from "../types/typechain";
import { useEffect, useState } from "react";
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
export enum gameStatusEnum {
  created = "created",
  open = "open",
  started = "started",
  lastTurn = "last turn",
  overtime = "overtime",
  finished = "finished",
  notFound = "not found",
}

export const useBestOfWebContract = ({
  tokenId,
  gameId,
  web3ctx,
}: BestOfWebContractArguments) => {
  const chainName = web3ctx.getChainFromId(web3ctx.chainId);
  const queryClient = useQueryClient();
  const toast = useToast();
  if (!web3ctx.signer) throw new Error("No signer is set");
  if (!web3ctx.provider) throw new Error("No provider is set");
  const provider = web3ctx.provider;
  const signer = web3ctx.signer;
  const contractState = useQuery(
    ["BestOfWebContract", "state", { chainId: web3ctx.chainId }],
    () => getContractState(chainName, provider),
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
    () => getRankTokenURI(chainName, provider),
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
    () => getRankTokenURI(chainName, provider),
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
    () => getGameState(chainName, provider, gameId ?? "0"),
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
      { chainId: web3ctx.chainId, player: web3ctx.account, gameId },
    ],
    () => getPlayersGame(chainName, provider)(web3ctx.account),
    {
      ...queryCacheProps,
      enabled:
        !!web3ctx.account &&
        !!web3ctx.chainId &&
        !!web3ctx.provider &&
        contractState.isSuccess,
      onError: (e) => console.error(e),
    }
  );

  const previousTurnStats = useQuery(
    [
      "BestOfWebContract",
      "previousTurnStats",
      { chainId: web3ctx.chainId, player: web3ctx.account },
    ],
    () => BestMethods.getPreviousTurnStats(chainName, provider)(gameId ?? "0"),
    {
      // ...queryCacheProps,
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
      queryClient.refetchQueries("BestOfWebContract");
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
    (gameId: string) => BestMethods.startGame(chainName, signer)(gameId),
    { ...commonProps }
  );

  const cancelGame = useMutation(
    (gameId: string) => BestMethods.cancelGame(chainName, signer)(gameId),
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
      BestMethods.checkSignature(chainName, provider)(
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
      BestMethods.endTurn(chainName, signer)(
        gameId,
        turnSalt,
        voters,
        votersRevealed
      ),
    { ...commonProps }
  );

  const leaveGame = useMutation(
    async (gameId: string) => BestMethods.leaveGame(chainName, signer)(gameId),
    {
      ...commonProps,
    }
  );

  const openRegistration = useMutation(
    (gameId: string) => BestMethods.openRegistration(chainName, signer)(gameId),
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
      BestMethods.submitProposal(chainName, signer)(
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
      BestMethods.submitVote(chainName, signer)(
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
      BestMethods.createGame(chainName, signer)(gameMaster, gameRank, gameId),
    { ...commonProps }
  );

  const setJoinRequirements = useMutation(
    ({
      gameId,
      config,
    }: {
      gameId: string;
      config: LibCoinVending.ConfigPositionStruct;
    }) => BestMethods.setJoinRequirements(chainName, signer)(gameId, config),
    { ...commonProps }
  );

  const approveAllRequirements = async (gameId: string) => {
    console.log("approve all");
    let approvals;
    try {
      const contract = getContract(chainName, signer);
      const reqs = await contract.getJoinRequirements(gameId);
      const values = reqs.ethValues;

      const value = values.bet.add(values.burn).add(values.pay);
      console.log("value.toString()", value.toString());
      approvals = Promise.all(
        reqs.contractAddresses.map(async (address, idx) => {
          const type = reqs.contractTypes[idx];
          const id = reqs.contractIds[idx];
          const cvalues = await contract.getJoinRequirementsByToken(
            gameId,
            address,
            id,
            type
          );
          const totalAllowanceRequired = ethers.BigNumber.from("0");
          totalAllowanceRequired
            .add(cvalues.bet.amount)
            .add(cvalues.pay.amount)
            .add(cvalues.lock.amount)
            .add(cvalues.burn.amount);

          const toalBalanceNeeded = totalAllowanceRequired.add(
            cvalues.have.amount
          );
          let allowance;
          let tx;
          if (type == ContractTypes.ERC20) {
            const erc20Contract = new ethers.Contract(
              address,
              ERC20Abi,
              signer
            ) as MockERC20;
            allowance = await erc20Contract["allowance"](
              web3ctx.account,
              contract.address
            );
            if (allowance.lt(totalAllowanceRequired)) {
              tx = await erc20Contract
                .increaseAllowance(
                  contract.address,
                  totalAllowanceRequired.sub(allowance)
                )
                .then((r) => r.wait(1));
            }
          } else if (type == ContractTypes.ERC1155) {
            const ac = ethers.utils.getAddress(address);
            console.log("is ERC1155", address, contract.address, ac);
            const erc1155Contract = new ethers.Contract(
              address,
              ERC1155Abi,
              signer
            ) as MockERC1155;

            const isApproved = await erc1155Contract.isApprovedForAll(
              web3ctx.account,
              contract.address
            );
            allowance = isApproved;
            if (!isApproved) {
              tx = await erc1155Contract
                .setApprovalForAll(contract.address, true)
                .then((r) => r.wait(1));
            }
          } else {
            const erc721Contract = new ethers.Contract(
              address,
              ERC721Abi,
              signer
            ) as MockERC721;
            const isApproved = await erc721Contract.isApprovedForAll(
              web3ctx.account,
              contract.address
            );
            allowance = isApproved;
            if (!isApproved) {
              tx = await erc721Contract
                .setApprovalForAll(contract.address, true)
                .then((r) => r.wait(1));
            }
          }
          return { tx, allowance };
        })
      );
    } catch (e) {
      return e;
    }
    console.log("approve all", approvals);
    return approvals;
  };

  const approveAll = useMutation(
    async (gameId: string) => await approveAllRequirements(gameId),
    {
      ...commonProps,
    }
  );
  // const test = approveAll.mutate(gameId)
  // test
  const joinGame = useMutation(
    async (gameId: string) => BestMethods.joinGame(chainName, signer)(gameId),
    {
      ...commonProps,
    }
  );

  const [isGameCreator, setIsGameCreator] = useState(false);
  const [isInGame, setIsInGame] = useState(false);

  const _gsd = gameState.data;
  useEffect(() => {
    if (gameId) {
      console.log(
        "_gsd?.createdBy, web3ctx.account",
        _gsd?.createdBy,
        web3ctx.account,
        playersGame.data
      );
      if (_gsd?.createdBy === web3ctx.account) {
        console.log("setIsGameCreator to true");
        setIsGameCreator(true);
      } else {
        setIsGameCreator(false);
      }
      console.log(
        "useEffect gsd",
        gameId.toString(),
        playersGame.data?.toString()
      );
      if (playersGame.data?.eq(gameId)) {
        setIsInGame(true);
      } else {
        setIsInGame(false);
      }
    }
  }, [web3ctx.account, _gsd?.createdBy, gameId, playersGame.data, setIsInGame]);

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
    isGameCreator,
    isInGame,
    previousTurnStats,
  };
};

export default useBestOfWebContract;
