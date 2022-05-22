const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  setupAddresses,
  setupEnvironment,
  baseFee,
  signMessage,
  CONTRACT_NAME,
  CONTRACT_VERSION,
} = require("./utils");
const path = require("path");
const { time, constants } = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");
const {
  ZERO_ADDRESS,
  ZERO_BYTES32,
} = require("@openzeppelin/test-helpers/src/constants");
// import { Multipass } from '../types/contracts/Multipass'
let adr;
let env;

const scriptName = path.basename(__filename, ".js");
const NEW_DOMAIN_NAME1 = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
const NEW_DOMAIN_NAME2 = "newDomainName2";
const NEW_DOMAIN_NAME3 = "newDomainName3";
const DEFAULT_FREE_REGISTRATIONS = new ethers.BigNumber.from(1000);
const DEFAULT_FEE = ethers.utils.parseEther("2");
const DEFAULT_DISCOUNT = ethers.utils.parseEther("1");
const DEFAULT_REWARD = ethers.utils.parseEther("0.5");

describe(scriptName, () => {
  beforeEach(async () => {
    adr = await setupAddresses();
    env = await setupEnvironment(adr.contractDeployer, adr.multipassOwner);
  });
  it("is Owned by contract owner", async () => {
    expect(await env.multipass.owner()).to.be.equal(adr.multipassOwner.address);
  });
  it("Has zero domains ", async () => {
    expect(await env.multipass.getContractState()).to.be.equal(0);
  });
  it("Supports interface ERC165", async () => {});
  it("Supports interface IMultipass", async () => {});
  it("Emits when new domain initialized", async () => {
    await expect(
      await env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.utils.parseEther("3"),
          NEW_DOMAIN_NAME1,
          ethers.utils.parseEther("1"),
          ethers.utils.parseEther("1")
        )
    ).to.emit(env.multipass, "InitializedDomain");
  });
  it("Reverts if intializing domain name props are wrong", async () => {
    await expect(
      env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.utils.parseEther("3"),
          NEW_DOMAIN_NAME1,
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
          NEW_DOMAIN_NAME1,
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
          "",
          ethers.utils.parseEther("1"),
          ethers.utils.parseEther("2")
        )
    ).to.be.revertedWith(
      "Multipass->initializeDomain: Domain name cannot be empty"
    );

    await expect(
      env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          1000,
          ethers.constants.MaxUint256,
          NEW_DOMAIN_NAME1,
          ethers.constants.MaxUint256,
          ethers.utils.parseEther("1")
        )
    ).to.be.revertedWith(
      "Multipass->initializeDomain: referrerReward + referralDiscount cause overflow"
    );
  });
  describe("When a new domain was initialized", () => {
    let numDomains = 0;
    beforeEach(async () => {
      await env.multipass
        .connect(adr.multipassOwner)
        .initializeDomain(
          adr.registrar.address,
          DEFAULT_FREE_REGISTRATIONS,
          DEFAULT_FEE,
          NEW_DOMAIN_NAME1,
          DEFAULT_REWARD,
          DEFAULT_DISCOUNT
        );
      numDomains = 1;
    });
    it("Reverts if domain name already registered", async () => {
      await expect(
        env.multipass
          .connect(adr.multipassOwner)
          .initializeDomain(
            adr.registrar.address,
            DEFAULT_FREE_REGISTRATIONS,
            DEFAULT_FEE,
            NEW_DOMAIN_NAME1,
            DEFAULT_REWARD,
            DEFAULT_DISCOUNT
          )
      ).to.be.revertedWith(
        "Multipass->initializeDomain: Domain name already indexed"
      );
    });
    it("Domain name state is equal to initial values and is not active", async () => {
      const resp = await env.multipass.getDomainState(NEW_DOMAIN_NAME1);
      expect(ethers.utils.toUtf8String(resp["name"])).to.be.equal(
        NEW_DOMAIN_NAME1
      );
      expect(resp["fee"]).to.be.equal(DEFAULT_FEE);
      expect(resp["freeRegistrationsNumber"]).to.be.equal(
        DEFAULT_FREE_REGISTRATIONS
      );
      expect(resp["referrerReward"]).to.be.equal(DEFAULT_REWARD);
      expect(resp["referralDiscount"]).to.be.equal(DEFAULT_DISCOUNT);
      expect(resp["isActive"]).to.be.equal(false);
      expect(resp["registrar"]).to.be.equal(adr.registrar.address);
      expect(resp["ttl"]).to.be.equal(0);
      expect(resp["registerSize"].toString()).to.be.equal("0");
    });
    it("Incremented number of domains", async () => {
      expect(await env.multipass.getContractState()).to.be.equal(numDomains);
    });

    it("Does not allow to register because is not active", async () => {
      await expect(
        env.multipass
          .connect(adr.player1)
          .register(
            NEW_DOMAIN_NAME1,
            "player1",
            "player1id",
            adr.player1.address,
            constants.ZERO_BYTES32,
            0,
            constants.ZERO_ADDRESS,
            constants.ZERO_BYTES32,
            constants.ZERO_BYTES32,
            constants.ZERO_BYTES32
          )
      ).to.be.revertedWith("Multipass->register: domain is not active");
    });

    describe.only("when domain was set to active", () => {
      beforeEach(async () => {
        await env.multipass
          .connect(adr.multipassOwner)
          .activateDomain(NEW_DOMAIN_NAME1);
      });
      it("Should be active", async () => {
        const resp = await env.multipass.getDomainState(NEW_DOMAIN_NAME1);
        expect(resp["isActive"]).to.be.true;
      });

      it("Should allow to register with correct signatures", async () => {
        let { chainId } = await ethers.provider.getNetwork();

        const domain = {
          name: CONTRACT_NAME,
          version: CONTRACT_VERSION,
          chainId,
          verifyingContract: env.multipass.address,
        };

        const registrarMessage = {
          name: "Player1",
          id: "Player1id",
          domainName: NEW_DOMAIN_NAME1,
          deadline: new ethers.BigNumber.from(9999),
          nonce: new ethers.BigNumber.from(0),
        };

        const signature = await signMessage(
          registrarMessage,
          env.multipass.address,
          adr.registrar
        );

        // // console.log(domain), console.log(types);
        // const signature = await adr.registrar._signTypedData(
        //   domain,
        //   types,
        //   registrarMessage
        // );

        // const verifiedAddress = ethers.utils.verifyTypedData(
        //   domain,
        //   types,
        //   registrarMessage,
        //   signature
        // );
        // console.log(
        //   "ethers validation, ",
        //   adr.registrar.address,
        //   verifiedAddress
        // );
        // expect(verifiedAddress).to.equal(adr.registrar.address); // works !
        // console.log("registrarSignature:", registrarSignature);

        // console.log(
        //   "rregistrarMessage:",
        //   registrarMessage,
        //   "registrar",
        //   adr.registrar.address,
        //   "verifier",
        //   env.multipass.address
        // );
        await expect(
          env.multipass
            .connect(adr.registrar)
            .register(
              registrarMessage.domainName,
              registrarMessage.name,
              registrarMessage.id,
              adr.player1.address,
              signature,
              registrarMessage.deadline,
              ZERO_ADDRESS,
              ZERO_BYTES32,
              ZERO_BYTES32,
              ZERO_BYTES32
            )
        ).to.be.revertedWith(
          "Multipass->register: Registrar signature is not valid1"
        );
        // const latestBlock = await hre.ethers.provider.getBlock("latest");
        // console.log("late", latestBlock);
      });
    });
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
