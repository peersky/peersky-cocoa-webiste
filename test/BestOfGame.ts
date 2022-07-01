import { AdrSetupResult, EnvSetupResult, SignerIdentity } from "./utils";
import {
  setupAddresses,
  setupEnvironment,
  getUserRegisterProps,
  signMessage,
} from "./utils";
import { LibMultipass } from "../types/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
import { getInterfaceID } from "../scripts/libraries/utils";
import { expect } from "chai";
import { ethers } from "hardhat";
import { IMultipass__factory } from "../types/factories/contracts/interfaces/IMultipass__factory";
const path = require("path");
const { time, constants } = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");
const {
  ZERO_ADDRESS,
  ZERO_BYTES32,
} = require("@openzeppelin/test-helpers/src/constants");

const scriptName = path.basename(__filename);

let adr: AdrSetupResult;

let env: EnvSetupResult;

describe(scriptName, () => {
  beforeEach(async () => {
    adr = await setupAddresses();
    env = await setupEnvironment({
      contractDeployer: adr.contractDeployer,
      multipassOwner: adr.multipassOwner,
      bestOfOwner: adr.gameOwner,
    });
  });
  it("Is Owned by contract owner", async () => {
    expect(await env.bestOfGame.owner()).to.be.equal(
      adr.gameOwner.wallet.address
    );
  });
  it("Transfer ownership can be done only by contract owner", async () => {
    await expect(
      env.bestOfGame
        .connect(adr.gameOwner.wallet)
        .transferOwnership(adr.gameCreator1.wallet.address)
    ).to.emit(env.bestOfGame, "OwnershipTransferred(address,address)");

    await expect(
      env.bestOfGame
        .connect(adr.maliciousActor1.wallet)
        .transferOwnership(adr.gameCreator1.wallet.address)
    ).to.revertedWith("LibDiamond: Must be contract owner");
  });
  it("has rank token assigned", async () => {
    const state = await env.bestOfGame.getContractState();
    await expect(state.rankToken.tokenAddress).to.be.equal(
      env.rankToken.address
    );
  });
});
