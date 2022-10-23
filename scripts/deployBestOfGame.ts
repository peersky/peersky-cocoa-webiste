import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { deployDiamond } from "./libraries/diamond";
import { BestOfInit } from "../types/typechain/contracts/initializers/BestOfInit";
import { transferOwnership } from "./libraries/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const deploy = async ({
  ownerAddress,
  signer,
  version,
  name,
  gameInitializer,
}: {
  ownerAddress: string;
  signer?: Wallet | SignerWithAddress;
  version: string;
  name: string;
  gameInitializer: BestOfInit.ContractInitializerStruct;
}) => {
  const _signer = signer ?? (await ethers.getSigners().then((s) => s[0]));
  if (!_signer || !ownerAddress || !signer || !version || !name)
    throw new Error("Missing properties");

  const diamondAddress = await deployDiamond(
    [
      "DiamondLoupeFacet",
      "OwnershipFacet",
      "BestOfFacet",
      "GameMastersFacet",
      "RequirementsFacet",
      "EIP712InspectorFacet",
    ],
    _signer,
    "BestOfInit",
    [name, version, gameInitializer]
  );

  const rankToken = await ethers.getContractAt(
    "RankToken",
    gameInitializer.rankTokenAddress
  );
  await rankToken.connect(_signer).functions.transferOwnership(diamondAddress);

  await transferOwnership(_signer, ownerAddress, diamondAddress);

  return diamondAddress;
};

if (require.main === module) {
  if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
  if (!process.env.CONTRACTS_OWNER)
    throw new Error("CONTRACTS_OWNER not exported");
  if (
    !process.env.MULTIPASS_CONTRACT_VERSION ||
    !process.env.MULTIPASS_CONTRACT_NAME
  )
    throw new Error("Contract name/version not exported");

  if (
    !process.env.BLOCKS_PER_TURN ||
    !process.env.MAX_PLAYERS ||
    !process.env.MIN_PLAYERS ||
    !process.env.RANK_TOKEN_ADDRESS ||
    !process.env.BLOCKS_TO_JOIN ||
    !process.env.GAME_PRICE_ETH ||
    !process.env.JOIN_GAME_PRICE_ETH ||
    !process.env.MAX_TURNS ||
    !process.env.NUM_WINNERS
  )
    throw new Error("Best of initializer variables not set");

  const settings: BestOfInit.ContractInitializerStruct = {
    blocksPerTurn: process.env.BLOCKS_PER_TURN,
    maxTurns: process.env.MAX_TURNS,
    maxPlayersSize: process.env.MAX_PLAYERS,
    minPlayersSize: process.env.MIN_PLAYERS,
    rankTokenAddress: process.env.RANK_TOKEN_ADDRESS,
    blocksToJoin: process.env.BLOCKS_TO_JOIN,
    gamePrice: ethers.utils.parseEther(process.env.GAME_PRICE_ETH),
    joinGamePrice: ethers.utils.parseEther(process.env.JOIN_GAME_PRICE_ETH),
    numWinners: process.env.NUM_WINNERS,
  };

  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  deploy({
    ownerAddress: process.env.CONTRACTS_OWNER,
    // signer,
    version: process.env.MULTIPASS_CONTRACT_VERSION,
    name: process.env.MULTIPASS_CONTRACT_NAME,
    gameInitializer: settings,
  })
    .then((resp: any) => {
      console.log("Best of game deployed:", resp);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deploy = deploy;
export default { deploy };
