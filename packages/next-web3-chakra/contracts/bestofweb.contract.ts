// import { BestOfDiamond } from "../../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
// import { ethers } from "ethers";
// import deploymentMumbai from "../../../deployments/mumbai/BestOfGame.json";
// import { SupportedChains } from "../types";
// const artifacts: Partial<
//   Record<SupportedChains, { contractAddress: string; abi: any[] }>
// > = {
//   mumbai: {
//     contractAddress: deploymentMumbai.address,
//     abi: deploymentMumbai.abi,
//   },
// };

// const getArtifact = (chain: SupportedChains) => {
//   const artifact = artifacts[chain];
//   if (!artifact) throw new Error("Contract deployment not found");
//   return artifact;
// };

// export const getContractState = async (
//   chain: SupportedChains,
//   signerOrProvider: ethers.Signer | ethers.providers.Provider
// ) => {
//   const artifact = getArtifact(chain);
//   const contract = new ethers.Contract(
//     artifact.contractAddress,
//     artifact.abi,
//     signerOrProvider
//   ) as BestOfDiamond;
//   return await contract.getContractState();
// };

// export const getPlayersGame =
//   (
//     chain: SupportedChains,
//     signerOrProvider: ethers.Signer | ethers.providers.Provider
//   ) =>
//   async (account: string) => {
//     const artifact = getArtifact(chain);
//     const contract = new ethers.Contract(
//       artifact.contractAddress,
//       artifact.abi,
//       signerOrProvider
//     ) as BestOfDiamond;
//     return await contract.getPlayersGame(account);
//   };

// export const getGameState =
//   (
//     chain: SupportedChains,
//     signerOrProvider: ethers.Signer | ethers.providers.Provider
//   ) =>
//   async (gameId: string) => {
//     const artifact = getArtifact(chain);
//     const contract = new ethers.Contract(
//       artifact.contractAddress,
//       artifact.abi,
//       signerOrProvider
//     ) as BestOfDiamond;
//     const gameMaster = await contract.getGM(gameId);
//     const joinRequirements = await contract.getJoinRequirements(gameId);
//     const requirementsPerContract = await Promise.all(
//       joinRequirements.conctractAddresses.map(async (address, idx) => {
//         return contract.getJoinRequirementsByToken(
//           gameId,
//           address,
//           joinRequirements.contractIds[idx],
//           joinRequirements.contractTypes[idx]
//         );
//       })
//     );
//     const scores = await contract.getScores(gameId);
//     const currentTurn = await contract.getTurn(gameId);
//     const isFinished = await contract.isGameOver(gameId);
//     const isOvetime = await contract.isOvertime(gameId);
//     const isLastTurn = await contract.isLastTurn(gameId);

//     return {
//       gameMaster,
//       joinRequirements,
//       requirementsPerContract,
//       scores,
//       currentTurn,
//       isFinished,
//       isOvetime,
//       isLastTurn,
//     };
//   };
