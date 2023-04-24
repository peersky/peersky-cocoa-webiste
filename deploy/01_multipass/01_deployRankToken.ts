import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BestOfDiamond } from "../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol";
import { ethers } from "hardhat";
// import {
//   MULTIPASS_CONTRACT_VERSION,
//   MULTIPASS_CONTRACT_NAME,
// } from "../../test/utils";
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, diamond } = deployments;

  const { deployer, owner } = await getNamedAccounts();
  if (!process.env.IPFS_GATEWAY_URL || !process.env.RANK_TOKEN_PATH)
    throw new Error("env variables not set");
  if (!owner) throw new Error("Owner not set");
  const URI = process.env.IPFS_GATEWAY_URL + process.env.RANK_TOKEN_PATH;
  await deploy("RankToken", {
    from: deployer,
    args: [URI, owner],
    skipIfAlreadyDeployed: true,
  });
};

export default func;
func.tags = ["ranktoken"];
