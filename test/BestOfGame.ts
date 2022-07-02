import { AdrSetupResult, EnvSetupResult, SignerIdentity } from "./utils";
import {
  setupAddresses,
  setupEnvironment,
  getUserRegisterProps,
  signMessage,
  BOGSettings,
} from "./utils";
import { getInterfaceID } from "../scripts/libraries/utils";
import { expect } from "chai";
import { IBestOf } from "../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
import { ethers } from "hardhat";
const path = require("path");
const { time, constants } = require("@openzeppelin/test-helpers");
const { BigNumber } = require("ethers");
const {
  ZERO_ADDRESS,
  ZERO_BYTES32,
} = require("@openzeppelin/test-helpers/src/constants");
import { TokenMust, TokenTypes } from "../types/enums";
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
  it("Has correct initial settings", async () => {
    const state = await env.bestOfGame
      .connect(adr.gameCreator1.wallet)
      .getContractState();
    expect(state.gamePrice).to.be.equal(BOGSettings.BOG_GAME_PRICE);
    expect(state.joinGamePrice).to.be.equal(BOGSettings.BOG_JOIN_GAME_PRICE);
    expect(state.numGames).to.be.equal(0);
    expect(state.rankToken.tokenAddress).to.be.equal(env.rankToken.address);
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
  it("Can create game only with valid payments", async () => {
    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 0)
    ).to.revertedWith("BOG->CreateGame: Not enough payment");
    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 0, {
          value: BOGSettings.BOG_GAME_PRICE,
        })
    ).to.emit(env.bestOfGame, "gameCreated");
  });

  it("Cannot perform actions on games that do not exist", async () => {
    await expect(
      env.bestOfGame.connect(adr.gameCreator1.wallet).joinGame(1, {
        value: BOGSettings.BOG_GAME_PRICE,
      })
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame
        .connect(adr.gameMaster1.wallet)
        .submitProposal(
          0,
          ethers.utils.formatBytes32String(""),
          ethers.utils.formatBytes32String(""),
          ethers.utils.formatBytes32String("")
        )
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame
        .connect(adr.gameMaster1.wallet)
        .submitVote(
          0,
          ethers.utils.formatBytes32String(""),
          [1, 1, 1],
          ethers.utils.formatBytes32String("")
        )
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).openRegistration(0)
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).addJoinRequirements(0, {
        token: { tokenAddress: ZERO_ADDRESS, tokenType: 0, tokenId: 1 },
        amount: 1,
        must: 0,
        requireParticularERC721: false,
      })
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).removeJoinRequirement(0, 0)
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).popJoinRequirements(0)
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).joinGame(0)
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).startGame(0)
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
    await expect(
      env.bestOfGame
        .connect(adr.gameMaster1.wallet)
        .endTurn(0, 1, [ZERO_ADDRESS])
    ).to.be.revertedWith("BestOf->onlyExistingGame: Game does not exist");
  });
  it("Succedes to create ranked game only if sender has correspoding tier rank token", async () => {
    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 1, {
          value: BOGSettings.BOG_GAME_PRICE,
        })
    ).to.be.revertedWith("fulfillTokenRequirement: ERC1155 balance not valid");
    await env.rankToken
      .connect(adr.gameOwner.wallet)
      .mint(
        adr.gameCreator1.wallet.address,
        1,
        1,
        ethers.utils.formatBytes32String("")
      );
    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 1, {
          value: BOGSettings.BOG_GAME_PRICE,
        })
    ).to.be.emit(env.bestOfGame, "gameCreated");

    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 2, {
          value: BOGSettings.BOG_GAME_PRICE,
        })
    ).to.be.revertedWith("fulfillTokenRequirement: ERC1155 balance not valid");
    await env.rankToken
      .connect(adr.gameOwner.wallet)
      .mint(
        adr.gameCreator1.wallet.address,
        1,
        2,
        ethers.utils.formatBytes32String("")
      );
    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 2, {
          value: BOGSettings.BOG_GAME_PRICE,
        })
    ).to.be.emit(env.bestOfGame, "gameCreated");
  });
  describe("When a game was created", () => {
    beforeEach(async () => {
      await env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 0, {
          value: BOGSettings.BOG_GAME_PRICE,
        });
    });
    it("Incremented number of games correctly", async () => {
      const state = await env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        .getContractState();
      expect(state.numGames).to.be.equal(1);
    });
    it("Players cannot join until registration is open", async () => {
      await expect(
        env.bestOfGame.connect(adr.gameMaster1.wallet).joinGame(1)
      ).to.be.revertedWith(
        "LibTurnBasedGame->addPlayer: Game cannot be joined at the moment"
      );
    });
    it.only("Game creator can add join requirements", async () => {
      const requirement: IBestOf.TokenRequirementStruct = {
        token: {
          tokenAddress: env.mockERC20.address,
          tokenType: TokenTypes.ERC20,
          tokenId: 0,
        },
        amount: "1",
        requireParticularERC721: false,
        must: TokenMust.HAVE,
      };
      await expect(
        env.bestOfGame
          .connect(adr.gameCreator1.wallet)
          .addJoinRequirements(1, requirement)
      ).to.be.emit(env.bestOfGame, "RequirementAdded");
    });
  });
});
