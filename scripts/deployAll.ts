// import deployMultipass from "./deployMultipass";
// import deployRankToken from "./deployRankToken";
// import deployBestOfGame from "./deployBestOfGame";
// import { ethers } from "hardhat";
// import { Wallet } from "ethers";
// import { BestOfInit } from "../types/contracts/initializers/BestOfInit";

// async function main({
//   signer,
//   multipassOwner,
//   bestOfOwner,
//   multipassName,
//   multipassVersion,
// }: {
//   signer: Wallet;
//   multipassOwner: string;
//   bestOfOwner: string;
//   multipassName: string;
//   multipassVersion: string;
// }) {
//   const multipassAddress = await deployMultipass.deploy({
//     signer: signer,
//     ownerAddress: multipassOwner,
//     version: multipassVersion,
//     name: multipassName,
//   });
//   console.log("Multipass deployed:", multipassAddress);

//   const rankToken = await deployRankToken.deploy({
//     signer: signer,
//     owner: process.env.CONTRACTS_OWNER,
//   });
//   console.log("Rank token deployed:", rankToken.address);
//   if (!rankToken.address)
//     throw new Error("No rankTokenAddress - cannot proceed");
//   if (!process.env.BESTOF_CONTRACT_VERSION || !process.env.BESTOF_CONTRACT_NAME)
//     throw new Error("Best of game name/version not exported");
//   if (
//     !process.env.BLOCKS_PER_TURN ||
//     !process.env.TURNS_PER_ROUND ||
//     !process.env.MAX_PLAYERS ||
//     !process.env.MIN_PLAYERS ||
//     !process.env.CAN_JOIN_WHEN_STARTED ||
//     !process.env.MAX_ROUNDS ||
//     !process.env.BLOCKS_TO_JOIN ||
//     !process.env.GAME_PRICE_ETH ||
//     !process.env.JOIN_GAME_PRICE_ETH ||
//     !process.env.JOIN_POLICY
//   )
//     throw new Error("Best of initializer variables not set");
//   const joinPolicy = Number(process.env.JOIN_POLICY);
//   if (isNaN(joinPolicy))
//     throw new Error(
//       "Join policy must be enum number defined in LibTBG.JoinPolicy"
//     );

//   const settings: BestOfInit.ContractInitializerStruct = {
//     blocksPerTurn: process.env.BLOCKS_PER_TURN,
//     turnsPerRound: process.env.TURNS_PER_ROUND,
//     maxPlayersSize: process.env.MAX_PLAYERS,
//     minPlayersSize: process.env.MIN_PLAYERS,
//     rankTokenAddress: rankToken.address,
//     canJoinGameWhenStarted:
//       process.env.CAN_JOIN_WHEN_STARTED === "true" ? true : false,
//     maxRounds: process.env.MAX_ROUNDS,
//     blocksToJoin: process.env.BLOCKS_TO_JOIN,
//     gamePrice: ethers.utils.parseEther(process.env.GAME_PRICE_ETH),
//     joinGamePrice: ethers.utils.parseEther(process.env.JOIN_GAME_PRICE_ETH),
//     joinPolicy: joinPolicy,
//   };

//   const bestOfAddress = await deployBestOfGame.deploy({
//     signer: signer,
//     ownerAddress: process.env.CONTRACTS_OWNER,
//     version: process.env.BESTOF_CONTRACT_VERSION,
//     name: process.env.BESTOF_CONTRACT_NAME,
//     gameInitializer: settings,
//   });
//   console.log("BestOF deployed:", bestOfAddress);
// }

// if (require.main === module) {
//   if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
//   if (!process.env.CONTRACTS_OWNER)
//     throw new Error("CONTRACTS_OWNER not exported");
//   if (
//     !process.env.MULTIPASS_CONTRACT_VERSION ||
//     !process.env.MULTIPASS_CONTRACT_NAME
//   )
//     throw new Error("something not set");
//   main({
//     signer: new ethers.Wallet(process.env.PRIVATE_KEY),
//     multipassOwner: process.env.CONTRACTS_OWNER,
//     bestOfOwner: process.env.CONTRACTS_OWNER,
//     multipassName: process.env.MULTIPASS_CONTRACT_NAME,
//     multipassVersion: process.env.MULTIPASS_CONTRACT_VERSION,
//   })
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error);
//       process.exit(1);
//     });
// }

// export default { main };
