import {
  AdrSetupResult,
  EnvSetupResult,
  SignerIdentity,
  setupAddresses,
  setupEnvironment,
  getUserRegisterProps,
  signRegistrarMessage,
} from "./utils";
import { LibMultipass } from "../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
import { getInterfaceID } from "../scripts/libraries/utils";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SocialIdentityToken } from "../types/typechain";
import socialIdentityABI from "../abi/contracts/tokens/SocialIdentityToken.sol/SocialIdentityToken.json";

const path = require("path");
const { constants } = require("@openzeppelin/test-helpers");
const {
  ZERO_ADDRESS,
  ZERO_BYTES32,
} = require("@openzeppelin/test-helpers/src/constants");

let adr: AdrSetupResult;
let env: EnvSetupResult;
let token: SocialIdentityToken;

const initialBalances = ["40", "45", "15"];

const scriptName = path.basename(__filename);
describe(scriptName, () => {
  beforeEach(async () => {
    adr = await setupAddresses();
    env = await setupEnvironment({
      contractDeployer: adr.contractDeployer,
      multipassOwner: adr.multipassOwner,
      bestOfOwner: adr.gameOwner,
    });
    const Token = await ethers.getContractFactory(
      "SocialIdentityToken",
      adr.contractDeployer.wallet
    );
    token = (await Token.deploy(
      "Token",
      "TKN",
      [
        adr.gameMaster1.wallet.address,
        adr.gameMaster2.wallet.address,
        adr.gameMaster3.wallet.address,
      ],
      initialBalances
    )) as SocialIdentityToken;
    await token.deployed();
  });
  it("Has correct balances after mint", async () => {
    expect(await token.balanceOf(adr.gameMaster1.wallet.address)).to.be.equal(
      initialBalances[0]
    );
    expect(await token.balanceOf(adr.gameMaster2.wallet.address)).to.be.equal(
      initialBalances[1]
    );
    expect(await token.balanceOf(adr.gameMaster3.wallet.address)).to.be.equal(
      initialBalances[2]
    );
  });
  it("Purging emits Purged event", async () => {
    expect(
      await token
        .connect(adr.gameMaster1.wallet)
        .purge(adr.gameMaster2.wallet.address, initialBalances[0])
    )
      .to.emit(token, "Purged")
      .withArgs(
        adr.gameMaster2.wallet.address,
        adr.gameMaster1.wallet.address,
        initialBalances[0]
      );
  });
  it("delegate tokens emits DelegateUpdated", async () => {
    expect(
      await token
        .connect(adr.gameMaster1.wallet)
        .delegateTo(adr.gameMaster2.wallet.address, initialBalances[0])
    )
      .to.emit(token, "DelegateUpdated")
      .withArgs(
        adr.gameMaster1.wallet.address,
        adr.gameMaster2.wallet.address,
        initialBalances[0]
      );
  });
  it("delegate tokens emits TotalDelegated", async () => {
    expect(
      await token
        .connect(adr.gameMaster1.wallet)
        .delegateTo(adr.gameMaster2.wallet.address, initialBalances[0])
    )
      .to.emit(token, "TotalDelegated")
      .withArgs(adr.gameMaster2.wallet.address, initialBalances[0]);
  });
  it("Reverts if attempting to delegate more then signer has", async () => {
    await expect(
      token
        .connect(adr.gameMaster1.wallet)
        .delegateTo(
          adr.gameMaster2.wallet.address,
          (Number(initialBalances[0]) + 1).toString()
        )
    ).to.be.revertedWith("delegateTo: Not enough tokens");
  });
  it("Returns correct absolute values", async () => {
    expect(
      await token.absoluteTrustLevel(adr.gameMaster1.wallet.address)
    ).to.be.equal(initialBalances[0]);
    expect(
      await token.absoluteTrustLevel(adr.gameMaster2.wallet.address)
    ).to.be.equal(initialBalances[1]);
    expect(
      await token.absoluteTrustLevel(adr.gameMaster3.wallet.address)
    ).to.be.equal(initialBalances[2]);
    expect(
      await token.absoluteTrustLevel(adr.gameCreator1.wallet.address)
    ).to.be.equal("0");
  });
  it("Returns correct totalSupply", async () => {
    expect(await token.totalSupply()).to.be.equal(
      ethers.BigNumber.from(initialBalances[0])
        .add(initialBalances[1])
        .add(initialBalances[2])
    );
  });
  it("Returns correct relative levels", async () => {
    expect(
      await token.relativeTrustLevel(adr.gameMaster1.wallet.address)
    ).to.be.equal("40");
    expect(
      await token.relativeTrustLevel(adr.gameMaster2.wallet.address)
    ).to.be.equal("45");
    expect(
      await token.relativeTrustLevel(adr.gameMaster3.wallet.address)
    ).to.be.equal("15");
    expect(
      await token.relativeTrustLevel(adr.gameCreator1.wallet.address)
    ).to.be.equal("0");
  });
  describe("After purging max amount of own balance which is greater than targets balance", () => {
    beforeEach(async () => {
      await token
        .connect(adr.gameMaster1.wallet)
        .delegateTo(adr.gameCreator1.wallet.address, initialBalances[0]);
      await token
        .connect(adr.gameMaster2.wallet)
        .delegateTo(adr.gameCreator1.wallet.address, initialBalances[1]);
      await token
        .connect(adr.gameMaster3.wallet)
        .delegateTo(adr.gameCreator1.wallet.address, initialBalances[2]);
      await token
        .connect(adr.gameMaster1.wallet)
        .purge(adr.gameMaster2.wallet.address, initialBalances[0]);
    });
    it("Returns correct totalSupply", async () => {
      expect(await token.totalSupply()).to.be.equal(
        ethers.BigNumber.from(initialBalances[1])
          .sub(initialBalances[0])
          .add(initialBalances[2])
      );
    });
    it("Returns correct relative levels", async () => {
      // const ab = await token.absoluteTrustLevel(adr.gameMaster2.wallet.address);
      const ts = await token.totalSupply();
      const gm1al = await token.absoluteTrustLevel(
        adr.gameMaster1.wallet.address
      );
      const gm2al = await token.absoluteTrustLevel(
        adr.gameMaster2.wallet.address
      );
      const denominator = await token.quorumDenominator();
      // console.log(
      //   "balance of gm1:",
      //   gm1al.toString(),
      //   "totalsupply:",
      //   ts.toString(),
      //   "Math:",
      //   gm2al.mul(denominator).div(ts).toString()
      // );
      // const totalSu
      expect(
        await token.relativeTrustLevel(adr.gameMaster1.wallet.address)
      ).to.be.equal(gm1al.mul(denominator).div(ts));
      expect(
        await token.relativeTrustLevel(adr.gameMaster2.wallet.address)
      ).to.be.equal(gm2al.mul(denominator).div(ts));
      expect(
        await token.relativeTrustLevel(adr.gameMaster3.wallet.address)
      ).to.be.equal(
        ethers.BigNumber.from(initialBalances[2]).mul(denominator).div(ts)
      );
      expect(
        await token.relativeTrustLevel(adr.gameCreator1.wallet.address)
      ).to.be.equal("100");
    });
    it("Balances are correct", async () => {
      expect(await token.balanceOf(adr.gameMaster1.wallet.address)).to.be.equal(
        "0"
      );
      expect(await token.balanceOf(adr.gameMaster2.wallet.address)).to.be.equal(
        (Number(initialBalances[1]) - Number(initialBalances[0])).toString()
      );
    });
    it("Reverts on attempt to purge again (has no tokens)", async () => {
      await expect(
        token
          .connect(adr.gameMaster1.wallet)
          .purge(adr.gameMaster1.wallet.address, "1")
      ).to.be.revertedWith("purge: Not enough tokens");
    });
    it("Reduced amounts delegated by destination got reduced correctly", async () => {
      expect(
        await token.amountDelegatedTo(
          adr.gameMaster1.wallet.address,
          adr.gameCreator1.wallet.address
        )
      ).to.be.equal("0");
      expect(
        await token.amountDelegatedTo(
          adr.gameMaster2.wallet.address,
          adr.gameCreator1.wallet.address
        )
      ).to.be.equal(
        ethers.BigNumber.from(initialBalances[1]).sub(initialBalances[0])
      );
      expect(
        await token.amountDelegatedTo(
          adr.gameMaster3.wallet.address,
          adr.gameCreator1.wallet.address
        )
      ).to.be.equal(initialBalances[2]);
    });
    it("Returns correct absolute values", async () => {
      expect(
        await token.absoluteTrustLevel(adr.gameMaster1.wallet.address)
      ).to.be.equal("0");
      expect(
        await token.absoluteTrustLevel(adr.gameMaster2.wallet.address)
      ).to.be.equal(
        ethers.BigNumber.from(initialBalances[1]).sub(initialBalances[0])
      );
      expect(
        await token.absoluteTrustLevel(adr.gameMaster3.wallet.address)
      ).to.be.equal(initialBalances[2]);
      expect(
        await token.absoluteTrustLevel(adr.gameCreator1.wallet.address)
      ).to.be.equal(
        ethers.BigNumber.from(initialBalances[1])
          .sub(initialBalances[0])
          .add(initialBalances[2])
      );
    });
  });
  describe("after purge", () => {
    beforeEach(async () => {
      await token
        .connect(adr.gameMaster1.wallet)
        .purge(adr.gameMaster2.wallet.address, initialBalances[0]);
    });
    it("Balances are correct", async () => {
      expect(await token.balanceOf(adr.gameMaster1.wallet.address)).to.be.equal(
        "0"
      );
      expect(await token.balanceOf(adr.gameMaster2.wallet.address)).to.be.equal(
        (Number(initialBalances[1]) - Number(initialBalances[0])).toString()
      );
    });
  });
});
