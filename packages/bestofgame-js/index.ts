import { BestOfDiamond } from "../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
import { RankToken } from "../../types/typechain";
import { Bytes, BytesLike, ethers } from "ethers";
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

const getArtifact = (chain: SupportedChains) => {
  const artifact = artifacts[chain];
  if (!artifact) throw new Error("Contract deployment not found");
  return artifact;
};

const getRankArtifact = (chain: SupportedChains) => {
  const artifact = RankTokenArtifacts[chain];
  if (!artifact) throw new Error("Contract deployment not found");
  return artifact;
};

const getContract = (
  chain: SupportedChains,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const artifact = getArtifact(chain);
  return new ethers.Contract(
    artifact.contractAddress,
    artifact.abi,
    signerOrProvider
  ) as BestOfDiamond;
};
export const getContractState = async (
  chain: SupportedChains,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const contract = getContract(chain, signerOrProvider);
  return await contract.getContractState();
};

export const getPlayersGame = async (
  chain: SupportedChains,
  signerOrProvider: ethers.Signer | ethers.providers.Provider,
  account: string
) => {
  const contract = getContract(chain, signerOrProvider);
  return await contract.getPlayersGame(account);
};

export const getRankTokenURI = async (
  chain: SupportedChains,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const artifact = getRankArtifact(chain);
  const contract = new ethers.Contract(
    artifact.contractAddress,
    artifact.abi,
    signerOrProvider
  ) as RankToken;
  return await contract.uri("0");
};

export const getRankTokenBalance =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (tokenId: string, account: string) => {
    const artifact = getRankArtifact(chain);
    const contract = new ethers.Contract(
      artifact.contractAddress,
      artifact.abi,
      signerOrProvider
    ) as RankToken;
    return await contract.balanceOf(account, tokenId);
  };

export const getGameState = async (
  chain: SupportedChains,
  signerOrProvider: ethers.Signer | ethers.providers.Provider,
  gameId: string
) => {
  const contract = getContract(chain, signerOrProvider);
  const gameMaster = await contract.getGM(gameId);
  const joinRequirements = await contract.getJoinRequirements(gameId);
  const requirementsPerContract = await Promise.all(
    joinRequirements.conctractAddresses.map(async (address, idx) => {
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

  return {
    gameMaster,
    joinRequirements,
    requirementsPerContract,
    scores,
    currentTurn,
    isFinished,
    isOvetime,
    isLastTurn,
  };
};

export const createGame =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (gameMaster: string, gameRank: string) => {
    const contract = getContract(chain, signerOrProvider);
    const reqs = await contract.getContractState();

    const value = await reqs.BestOfState.gamePrice;

    return await contract["createGame(address,uint256)"](gameMaster, gameRank, {
      value: value,
    });
  };

export const joinGame =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (gameId: string) => {
    const contract = getContract(chain, signerOrProvider);
    const reqs = await contract.getJoinRequirements(gameId);

    const values = await reqs.ethValues;

    const value = values.bet.add(values.burn).add(values.pay);

    return await contract.joinGame(gameId, { value: value });
  };

export const startGame =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (gameId: string) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.startGame(gameId);
  };

export const cancelGame =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (gameId: string) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.cancelGame(gameId);
  };

export const checkSignature =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (message: BytesLike, signature: BytesLike, account: string) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.checkSignature(message, signature, account);
  };

export const endTurn =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (
    gameId: string,
    turnSalt: BytesLike,
    voters: string[],
    votersRevealed: [string, string, string][]
  ) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.endTurn(gameId, turnSalt, voters, votersRevealed);
  };

export const leaveGame =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (gameId: string) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.leaveGame(gameId);
  };

export const openRegistration =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (gameId: string) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.openRegistration(gameId);
  };

export const submitProposal =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (
    gameId: string,
    proposerHidden: BytesLike,
    proof: BytesLike,
    proposal: string
  ) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.submitProposal(
      gameId,
      proposerHidden,
      proof,
      proposal
    );
  };

export const submitVote =
  (
    chain: SupportedChains,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) =>
  async (
    gameId: string,
    votesHidden: [BytesLike, BytesLike, BytesLike],
    proof: BytesLike,
    signature: BytesLike
  ) => {
    const contract = getContract(chain, signerOrProvider);
    return await contract.submitVote(gameId, votesHidden, proof, signature);
  };
