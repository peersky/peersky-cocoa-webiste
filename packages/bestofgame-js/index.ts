import {
  BestOfDiamond,
  LibCoinVending,
} from "../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
import { RankToken } from "../../types/typechain";
import { BigNumberish, BytesLike, ethers } from "ethers";
import deploymentMumbai from "../../deployments/mumbai/BestOfGame.json";
import rankDeploymentMumbai from "../../deployments/mumbai/RankToken.json";
import { SupportedChains } from "../../types";
const artifacts: Partial<
  Record<SupportedChains, { contractAddress: string; abi: any[] }>
> = {
  mumbai: {
    contractAddress: deploymentMumbai.address,
    abi: deploymentMumbai.abi,
  },
};
const RankTokenArtifacts: Partial<
  Record<SupportedChains, { contractAddress: string; abi: any[] }>
> = {
  mumbai: {
    contractAddress: rankDeploymentMumbai.address,
    abi: rankDeploymentMumbai.abi,
  },
};

export const getArtifact = (chain: SupportedChains) => {
  const artifact = artifacts[chain];
  if (!artifact) throw new Error("Contract deployment not found");
  return artifact;
};

const getRankArtifact = (chain: SupportedChains) => {
  const artifact = RankTokenArtifacts[chain];
  if (!artifact) throw new Error("Contract deployment not found");
  return artifact;
};

export const getContract = (
  chain: SupportedChains,
  provider: ethers.providers.Web3Provider | ethers.Signer
) => {
  const artifact = getArtifact(chain);
  return new ethers.Contract(
    artifact.contractAddress,
    artifact.abi,
    provider
  ) as BestOfDiamond;
};
export const getContractState = async (
  chain: SupportedChains,
  provider: ethers.providers.Web3Provider
) => {
  const contract = getContract(chain, provider);
  return contract.getContractState();
};

export const getPlayersGame =
  (chain: SupportedChains, provider: ethers.providers.Web3Provider) =>
  async (account: string) => {
    const contract = getContract(chain, provider);
    return contract.getPlayersGame(account);
  };

export const getRankTokenURI = async (
  chain: SupportedChains,
  provider: ethers.providers.Web3Provider
) => {
  const artifact = getRankArtifact(chain);
  const contract = new ethers.Contract(
    artifact.contractAddress,
    artifact.abi,
    provider
  ) as RankToken;
  const retval = await contract.uri("0");
  return retval;
};

export const getRankTokenBalance =
  (chain: SupportedChains, provider: ethers.providers.Web3Provider) =>
  async (tokenId: string, account: string) => {
    const artifact = getRankArtifact(chain);
    const contract = new ethers.Contract(
      artifact.contractAddress,
      artifact.abi,
      provider
    ) as RankToken;
    return await contract.balanceOf(account, tokenId);
  };

export const getGameState = async (
  chain: SupportedChains,
  provider: ethers.providers.Web3Provider,
  gameId: string
) => {
  const contract = getContract(chain, provider);
  const gameMaster = await contract.getGM(gameId);
  const joinRequirements = await contract.getJoinRequirements(gameId);
  const requirementsPerContract = await Promise.all(
    joinRequirements.contractAddresses.map(async (address, idx) => {
      return contract.getJoinRequirementsByToken(
        gameId,
        address,
        joinRequirements.contractIds[idx],
        joinRequirements.contractTypes[idx]
      );
    })
  );
  const scores = await contract.getScores(gameId);
  const currentTurn = await contract.getTurn(gameId);
  const isFinished = await contract.isGameOver(gameId);
  const isOvetime = await contract.isOvertime(gameId);
  const isLastTurn = await contract.isLastTurn(gameId);
  const isOpen = await contract.isRegistrationOpen(gameId);
  const createdBy = await contract.gameCreator(gameId);
  const gameRank = await contract.getGameRank(gameId);
  const players = await contract.getPlayers(gameId);
  const canStart = await contract.canStartGame(gameId);

  return {
    gameMaster,
    joinRequirements,
    requirementsPerContract,
    scores,
    currentTurn,
    isFinished,
    isOvetime,
    isLastTurn,
    isOpen,
    createdBy,
    gameRank,
    players,
    canStart,
  };
};

export const createGame =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameMaster: string, gameRank: string, gameId?: BigNumberish) => {
    console.log("createGame", gameMaster, gameRank.toString());
    const contract = getContract(chain, signer);
    const reqs = await contract.getContractState();

    const value = reqs.BestOfState.gamePrice;
    if (gameId) {
      return await contract["createGame(address,uint256,uint256)"](
        gameMaster,
        gameId,
        gameRank,
        {
          value: value,
        }
      );
    } else {
      return await contract["createGame(address,uint256)"](
        gameMaster,
        gameRank,
        {
          value: value,
        }
      );
    }
  };

export const joinGame =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: string) => {
    const contract = getContract(chain, signer);
    console.log("requesting reqs", gameId);

    const reqs = await contract.getJoinRequirements(gameId);
    const values = reqs.ethValues;

    const value = values.bet.add(values.burn).add(values.pay);

    return contract
      .joinGame(gameId, { value: value.toString() ?? "0" })
      .then((tx) => tx.wait(1));
  };

export const startGame =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: string) => {
    const contract = getContract(chain, signer);
    return await contract.startGame(gameId);
  };

export const cancelGame =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: string) => {
    const contract = getContract(chain, signer);
    return await contract.cancelGame(gameId);
  };

export const checkSignature =
  (chain: SupportedChains, provider: ethers.providers.Web3Provider) =>
  async (message: BytesLike, signature: BytesLike, account: string) => {
    const contract = getContract(chain, provider);
    return await contract.checkSignature(message, signature, account);
  };

export const endTurn =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (
    gameId: string,
    turnSalt: BytesLike,
    voters: string[],
    votersRevealed: [string, string, string][]
  ) => {
    const contract = getContract(chain, signer);
    return (
      await contract.endTurn(gameId, turnSalt, voters, votersRevealed)
    ).wait(1);
  };

export const leaveGame =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: string) => {
    const contract = getContract(chain, signer);
    return contract.leaveGame(gameId).then((tx) => tx.wait(1));
  };

export const openRegistration =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: string) => {
    const contract = getContract(chain, signer);
    return await contract.openRegistration(gameId);
  };

export const submitProposal =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (
    gameId: string,
    proposerHidden: BytesLike,
    proof: BytesLike,
    proposal: string
  ) => {
    const contract = getContract(chain, signer);
    return await contract.submitProposal(
      gameId,
      proposerHidden,
      proof,
      proposal
    );
  };

export const submitVote =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (
    gameId: string,
    votesHidden: [BytesLike, BytesLike, BytesLike],
    proof: BytesLike,
    signature: BytesLike
  ) => {
    const contract = getContract(chain, signer);

    return await contract.submitVote(gameId, votesHidden, proof, signature);
  };

export const setJoinRequirements =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: string, config: LibCoinVending.ConfigPositionStruct) => {
    console.log("config", config, gameId);
    const contract = getContract(chain, signer);
    return await contract.setJoinRequirements(gameId, config);
  };

interface ApiErrorOptions extends ErrorOptions {
  status?: number;
}

class ApiError extends Error {
  status: number | undefined;
  constructor(message: string, options?: ApiErrorOptions) {
    super(message, { cause: options?.cause });
    this.status = options?.status;
  }
}

export async function getApiError(response: Response) {
  const body = await response.json();
  return new ApiError(body.msg || "server_error", {
    status: body?.status,
  });
}

export const getHistoricTurn =
  (chain: SupportedChains, provider: ethers.providers.Web3Provider) =>
  async (gameId: BigNumberish, turnId: BigNumberish) => {
    const contract = getContract(chain, provider);
    //list all events of gameId that ended turnId.
    const events = contract.filters.TurnEnded(gameId, turnId);
    const Proposalevents = contract.filters.ProposalSubmitted(gameId);
    //There shall be only one such event
    if (!events?.topics?.length || events?.topics?.length == 0) {
      const err = new ApiError("Game not found", { status: 404 });
      throw err;
    } else {
      const endTurnEvent = events?.topics[0];
      const players = endTurnEvent[2];
      const scores = endTurnEvent[3];
      const turnSalt = endTurnEvent[4];
      const voters = endTurnEvent[5] as any as string[];
      const votesRevealed = endTurnEvent[6] as any as string[];

      return { players, scores, turnSalt, voters, votesRevealed };
    }
  };

export const getPreviousTurnStats =
  (chain: SupportedChains, provider: ethers.providers.Web3Provider) =>
  async (gameId: BigNumberish) => {
    const contract = getContract(chain, provider);
    const currentTurn = await contract.getTurn(gameId);
    if (currentTurn.gt(1)) {
      return await getHistoricTurn(chain, provider)(gameId, currentTurn.sub(1));
    } else {
      return {
        players: "N/A",
        scores: "N/A",
        turnSalt: "N/A",
        voters: ["N/A"],
        votesRevealed: ["N/A"],
      };
    }
  };

export const getVoting =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: BigNumberish, turnId: BigNumberish) => {
    const contract = getContract(chain, signer);
    const proposalEvents = contract.filters.ProposalSubmitted(
      gameId,
      turnId,
      null,
      null,
      null
    );
    const voteEvents = contract.filters.VoteSubmitted(
      gameId,
      turnId,
      null,
      null,
      null
    );
    let proposals = [];
    let playersVoted = [];
    for (const proposalEvent in proposalEvents) {
      proposals.push(proposalEvent[4]);
    }
    for (const voteEvent in voteEvents) {
      playersVoted.push(voteEvent[2]);
    }
    return { proposals, playersVoted };
  };

export const getOngoingVoting =
  (chain: SupportedChains, signer: ethers.providers.JsonRpcSigner) =>
  async (gameId: BigNumberish) => {
    const contract = getContract(chain, signer);
    const currentTurn = await contract.getTurn(gameId);
    return getVoting(chain, signer)(gameId, currentTurn);
  };
