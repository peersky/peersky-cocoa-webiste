const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setupAddresses, setupEnvironment, baseFee } = require("./utils");
const path = require("path");
const { time, constants } = require("@openzeppelin/test-helpers");
// import { Multipass } from '../types/contracts/Multipass'
let adr;
let env;

const scriptName = path.basename(__filename, ".js");

describe(scriptName, () => {
  beforeEach(async () => {
    adr = await setupAddresses();
    env = await setupEnvironment(adr.contractDeployer, adr.multipassOwner);
  });
  it("should be owned by contract owner", async () => {
    // console.log("aaaa");
    expect(await env.multipass.owner()).to.be.equal(adr.multipassOwner.address);
  });
  it("Should emit event when new domain initialized", async () => {
    await expect(
      await env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.utils.parseEther("3"),
          ethers.utils.formatBytes32String("TestDomain"),
          ethers.utils.parseEther("1"),
          ethers.utils.parseEther("1")
        )
    ).to.emit(env.multipass, "InitializedDomain");
  });
  it("Initializing should throw props are worng", async () => {
    await expect(
      env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.utils.parseEther("3"),
          ethers.utils.formatBytes32String("TestDomain"),
          ethers.utils.parseEther("1.0001"),
          ethers.utils.parseEther("2")
        )
    ).to.be.revertedWith(
      "Multipass->initializeDomain: referral values are higher then fee itself"
    );
    await expect(
      env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          constants.ZERO_ADDRESS,
          1000,
          ethers.utils.parseEther("3"),
          ethers.utils.formatBytes32String("TestDomain"),
          ethers.utils.parseEther("1.0001"),
          ethers.utils.parseEther("2")
        )
    ).to.be.revertedWith(
      "Multipass->initializeDomain: You must provide a registrar address"
    );

    await expect(
      env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.utils.parseEther("3"),
          ethers.utils.formatBytes32String(""),
          ethers.utils.parseEther("1"),
          ethers.utils.parseEther("2")
        )
    ).to.be.revertedWith(
      "Multipass->initializeDomain: Domain name cannot be empty"
    );

    await env.multipass
      .connect(adr.multipassOwner)
      .initializeDomain(
        adr.registrar.address,
        1000,
        ethers.utils.parseEther("3"),
        ethers.utils.formatBytes32String("TestDomainDuplicate"),
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("2")
      );
    await expect(
      env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.utils.parseEther("3"),
          ethers.utils.formatBytes32String("TestDomainDuplicate"),
          ethers.utils.parseEther("1"),
          ethers.utils.parseEther("2")
        )
    ).to.be.revertedWith(
      "Multipass->initializeDomain: Domain name already indexed"
    );

    await expect(
      env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.constants.MaxUint256,
          ethers.utils.formatBytes32String("TestDomain"),
          ethers.constants.MaxUint256 ,
          ethers.utils.parseEther("1")
        )
    ).to.be.revertedWith(
      "Multipass->initializeDomain: referrerReward + referralDiscount cause overflow"
    );

  });
  describe("When new domain is initialized", () => {
    beforeEach(async () => {});
  });

  // describe("When new record is being made", () => {
  //   beforeEach(() => {});
  //   it("should make new record in DNS", async () => {});
  //   it("should ");
  // });
  // it("Should record Shopyto token address as native payment token", () => {});
  // it("Should record non-Shopyto token tx fee", () => {});
  // it("Should allow to mint and set price", () => {});
  // it("Should emit event on item is minted", () => {});
  // it("Should allow to transfer ownership", () => {});
  // it("Should allow to change base token with current token owners signature", () => {});
  // it("Should allow to change non native payments fee with current native payment token owners signature", () => {});

  // describe("When articules are being minted", () => {
  //   describe("When items with id already minted", () => {
  //     it("Should increase capacity of token id by mint amount", () => {});
  //   });
  //   it("Should mint token if Id does not exist", () => {});
  //   it("Should emit event on item is minted", () => {});
  //   it("Should throw if price is not set", () => {});
  //   it("Should throw if uri is not set", () => {});
  //   it("Should throw if ammount not specified", () => {});
  //   it("Should allow to purchase item", () => {});
  // });
  // describe("When individual item is being purchased", () => {
  //   it("Should thow if item does not exist", () => {});
  //   it("Should throw if amount is over the supply", () => {});
  //   it("Should throw if payment amount is incorrect", () => {});
  //   it("Should deduct supply by amount on success", () => {});
  //   it("Should emit on success", () => {});
  // });
  // describe("When multiple items (shopping cart) is being purchased", () => {
  //   it("Should thow if one of items does not exist", () => {});
  //   it("Should throw if one of items amount is over the supply", () => {});
  //   it("Should throw if payment amount is incorrect", () => {});
  //   it("Should not deduct any supply if transaction fails", () => {});
  //   it("Should deduct supply of each item by amount on success", () => {});

  //   it("Should emit on success", () => {});
  // });

  // it("should not allow to purchase for incorrect price", () => {});
});
