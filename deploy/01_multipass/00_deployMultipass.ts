import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  MULTIPASS_CONTRACT_VERSION,
  MULTIPASS_CONTRACT_NAME,
} from "../../test/utils";
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, diamond } = deployments;
  const { deployer } = await getNamedAccounts();

  await diamond.deploy("Multipass", {
    from: deployer,
    owner: deployer,
    log: true,
    facets: ["DNSFacet", "EIP712InspectorFacet", "MultipassInit"],
    execute: {
      methodName: "init",
      args: [MULTIPASS_CONTRACT_NAME, MULTIPASS_CONTRACT_VERSION],
    },
  });
};

export default func;
func.tags = ["multipass"];
