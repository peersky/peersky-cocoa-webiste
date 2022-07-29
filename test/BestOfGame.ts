import {
  AdrSetupResult,
  BOG_MIN_PLAYERS,
  EnvSetupResult,
  getTurnSalt,
  mockVote,
  MockVotes,
  ProposalSubmittion,
  SignerIdentity,
} from "./utils";
import {
  setupAddresses,
  setupEnvironment,
  getUserRegisterProps,
  signRegistrarMessage,
  BOGSettings,
  mineBlocks,
  mockProposalSecrets,
  mockProposals,
  mockVotes,
  getPlayers,
} from "./utils";
import { getInterfaceID } from "../scripts/libraries/utils";
import { expect, util } from "chai";
import {
  BestOfDiamond,
  IBestOf,
} from "../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/BestOfDiamond";
import { ethers } from "hardhat";
const path = require("path");
import { TokenMust, TokenTypes } from "../types/enums";
import { BigNumberish } from "ethers";
const scriptName = path.basename(__filename);

let votes: MockVotes;
let proposalsStruct: ProposalSubmittion[];
let adr: AdrSetupResult;
let votersAddresses: string[];
let env: EnvSetupResult;

const createGame = async (
  gameContract: BestOfDiamond,
  signer: SignerIdentity,
  gameMaster: string,
  gameRank: BigNumberish,
  openNow?: boolean
) => {
  await gameContract
    .connect(signer.wallet)
    ["createGame(address,uint256)"](gameMaster, gameRank, {
      value: BOGSettings.BOG_GAME_PRICE,
    });
  const gameId = await gameContract
    .getContractState()
    .then(
      (state: IBestOf.ContractStateStructOutput) => state.BestOfState.numGames
    );
  if (openNow)
    await gameContract.connect(signer.wallet).openRegistration(gameId);
};
const runExistingUntilLastTurn = async (
  gameId: BigNumberish,
  gameContract: BestOfDiamond,
  gameMaster: SignerIdentity
): Promise<void> => {
  await gameContract.connect(adr.gameCreator1.wallet).openRegistration(1);
  for (let i = 1; i < BOGSettings.BOG_MAX_PLAYERS + 1; i++) {
    let name = `player${i}` as any as keyof AdrSetupResult;
    gameContract
      .connect(adr[`${name}`].wallet)
      .joinGame(gameId, { value: BOGSettings.BOG_JOIN_GAME_PRICE });
  }
  await mineBlocks(BOGSettings.BOG_BLOCKS_TO_JOIN + 1);
  await gameContract.connect(gameMaster.wallet).startGame(1);
  proposalsStruct = await mockProposals({
    players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
    gameId: gameId,
    turn: 1,
    verifierAddress: gameContract.address,
  });

  for (let i = 0; i < BOGSettings.BOG_MAX_PLAYERS; i++) {
    await gameContract
      .connect(gameMaster.wallet)
      .submitProposal(
        gameId,
        proposalsStruct[i].proposerHidden,
        proposalsStruct[i].proof,
        proposalsStruct[i].proposal
      );
  }
  await gameContract
    .connect(gameMaster.wallet)
    .endTurn(gameId, getTurnSalt({ gameId: gameId, turn: 1 }), [], []);
  votersAddresses = getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS).map(
    (player) => player.wallet.address
  );
  for (let turn = 2; turn < BOGSettings.BOG_MAX_TURNS; turn++) {
    votes = await mockVotes({
      gameId: gameId,
      turn: turn,
      verifierAddress: gameContract.address,
      players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
      gm: gameMaster,
      proposals: proposalsStruct.map((item) => item.proposal),
      distribution: "equal",
    });
    proposalsStruct = await mockProposals({
      players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
      gameId: gameId,
      turn: turn,
      verifierAddress: gameContract.address,
    });
    for (let i = 0; i < BOGSettings.BOG_MAX_PLAYERS; i++) {
      await gameContract
        .connect(gameMaster.wallet)
        .submitProposal(
          1,
          proposalsStruct[i].proposerHidden,
          proposalsStruct[i].proof,
          proposalsStruct[i].proposal
        );
      let name = `player${i + 1}` as any as keyof AdrSetupResult;
      await gameContract
        .connect(adr[`${name}`].wallet)
        .submitVote(gameId, votes[i].voteHidden, votes[i].proof);
    }
    await gameContract.connect(gameMaster.wallet).endTurn(
      gameId,
      getTurnSalt({ gameId: 1, turn: turn }),
      votersAddresses,
      votes.map((vote) => vote.vote)
    );
  }
};

const mockValidVotes = async (
  players: [SignerIdentity, SignerIdentity, ...SignerIdentity[]],
  gameContract: BestOfDiamond,
  gameId: BigNumberish,
  submitNow?: boolean
) => {
  const turn = await gameContract.getTurn(gameId);
  votes = await mockVotes({
    gameId: gameId,
    turn: turn,
    verifierAddress: env.bestOfGame.address,
    players: players,
    gm: adr.gameMaster1,
    proposals: proposalsStruct.map((item) => item.proposal),
    distribution: "semiUniform",
  });
  if (submitNow) {
    votersAddresses = getPlayers(adr, players.length).map(
      (player) => player.wallet.address
    );
    for (let i = 0; i < votersAddresses.length; i++) {
      let name = `player${i + 1}` as any as keyof AdrSetupResult;
      await env.bestOfGame
        .connect(adr[`${name}`].wallet)
        .submitVote(gameId, votes[i].voteHidden, votes[i].proof);
    }
  }
};

const startGame = async (gameId: BigNumberish) => {
  await mineBlocks(BOGSettings.BOG_BLOCKS_TO_JOIN + 1);
  await env.bestOfGame.connect(adr.gameMaster1.wallet).startGame(1);
  proposalsStruct = await mockProposals({
    players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
    gameId: 1,
    turn: 1,
    verifierAddress: env.bestOfGame.address,
  });
};

const mockValidProposals = async (
  players: [SignerIdentity, SignerIdentity, ...SignerIdentity[]],
  gameContract: BestOfDiamond,
  gameMaster: SignerIdentity,
  gameId: BigNumberish,
  submitNow?: boolean
) => {
  const turn = await gameContract.getTurn(gameId);

  // getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS)
  proposalsStruct = await mockProposals({
    players: players,
    gameId: gameId,
    turn: turn,
    verifierAddress: gameContract.address,
  });
  if (submitNow) {
    for (let i = 0; i < players.length; i++) {
      await gameContract
        .connect(gameMaster.wallet)
        .submitProposal(
          1,
          proposalsStruct[i].proposerHidden,
          proposalsStruct[i].proof,
          proposalsStruct[i].proposal
        );
    }
  }
};

const fillParty = async (
  players: [SignerIdentity, SignerIdentity, ...SignerIdentity[]],
  gameContract: BestOfDiamond,
  gameId: BigNumberish,
  mineJoinBlocks: boolean
) => {
  for (let i = 0; i < players.length; i++) {
    // let name = `player${i}` as any as keyof AdrSetupResult;
    await gameContract
      .connect(players[i].wallet)
      .joinGame(gameId, { value: BOGSettings.BOG_JOIN_GAME_PRICE });
  }
  if (mineJoinBlocks) await mineBlocks(BOGSettings.BOG_BLOCKS_TO_JOIN + 1);
};
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
    expect(state.BestOfState.gamePrice).to.be.equal(BOGSettings.BOG_GAME_PRICE);
    expect(state.BestOfState.joinGamePrice).to.be.equal(
      BOGSettings.BOG_JOIN_GAME_PRICE
    );
    expect(state.BestOfState.numGames).to.be.equal(0);
    expect(state.BestOfState.rankToken.tokenAddress).to.be.equal(
      env.rankToken.address
    );
    expect(state.TBGSEttings.maxTurns).to.be.equal(BOGSettings.BOG_MAX_TURNS);
    expect(state.TBGSEttings.blocksPerTurn).to.be.equal(
      BOGSettings.BOG_BLOCKS_PER_TURN
    );
    expect(state.TBGSEttings.minPlayersSize).to.be.equal(
      BOGSettings.BOG_MIN_PLAYERS
    );
    expect(state.TBGSEttings.blocksToJoin).to.be.equal(
      BOGSettings.BOG_BLOCKS_TO_JOIN
    );
    expect(state.TBGSEttings.maxTurns).to.be.equal(BOGSettings.BOG_MAX_TURNS);
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
    await expect(state.BestOfState.rankToken.tokenAddress).to.be.equal(
      env.rankToken.address
    );
    expect(await env.rankToken.owner()).to.be.equal(env.bestOfGame.address);
  });
  it("Can create game only with valid payments", async () => {
    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 1)
    ).to.revertedWith("Not enough payment");
    await expect(
      env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 1, {
          value: BOGSettings.BOG_GAME_PRICE,
        })
    ).to.emit(env.bestOfGame, "gameCreated");
  });

  it("Cannot perform actions on games that do not exist", async () => {
    await expect(
      env.bestOfGame.connect(adr.gameCreator1.wallet).joinGame(1, {
        value: BOGSettings.BOG_GAME_PRICE,
      })
    ).to.be.revertedWith("no game found");
    proposalsStruct = await mockProposals({
      players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
      gameId: 1,
      turn: 1,
      verifierAddress: env.bestOfGame.address,
    });
    await expect(
      env.bestOfGame
        .connect(adr.gameMaster1.wallet)
        .submitProposal(
          2,
          proposalsStruct[0].proposerHidden,
          proposalsStruct[0].proof,
          proposalsStruct[0].proposal
        )
    ).to.be.revertedWith("no game found");
    votersAddresses = getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS).map(
      (player) => player.wallet.address
    );
    votes = await mockVotes({
      gameId: 1,
      turn: 1,
      verifierAddress: env.bestOfGame.address,
      players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
      gm: adr.gameMaster1,
      proposals: proposalsStruct.map((item) => item.proposal),
      distribution: "semiUniform",
    });
    await expect(
      env.bestOfGame
        .connect(adr.gameMaster1.wallet)
        .submitVote(1, votes[0].voteHidden, votes[0].proof)
    ).to.be.revertedWith("no game found");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).openRegistration(1)
    ).to.be.revertedWith("no game found");
    // await expect(
    //   env.bestOfGame.connect(adr.gameMaster1.wallet).addJoinRequirements(0, {
    //     token: { tokenAddress: ZERO_ADDRESS, tokenType: 0, tokenId: 1 },
    //     amount: 1,
    //     must: 0,
    //     requireParticularERC721: false,
    //   })
    // ).to.be.revertedWith("no game found");
    // await expect(
    //   env.bestOfGame.connect(adr.gameMaster1.wallet).removeJoinRequirement(0, 0)
    // ).to.be.revertedWith("no game found");
    // await expect(
    //   env.bestOfGame.connect(adr.gameMaster1.wallet).popJoinRequirements(0)
    // ).to.be.revertedWith("no game found");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).joinGame(0)
    ).to.be.revertedWith("no game found");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).startGame(0)
    ).to.be.revertedWith("no game found");
    await expect(
      env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
        1,
        getTurnSalt({ gameId: 1, turn: 1 }),
        votersAddresses,
        votes.map((vote) => vote.vote)
      )
    ).to.be.revertedWith("no game found");
    await expect(
      env.bestOfGame
        .connect(adr.gameMaster1.wallet)
        .submitProposal(
          1,
          proposalsStruct[0].proposerHidden,
          proposalsStruct[0].proof,
          proposalsStruct[0].proposal
        )
    ).to.be.revertedWith("no game found");
  });
  it("Succedes to create ranked game only if sender has correspoding tier rank token", async () => {
    await expect(
      env.bestOfGame
        .connect(adr.maliciousActor1.wallet)
        ["createGame(address,uint256)"](adr.gameMaster1.wallet.address, 2, {
          value: BOGSettings.BOG_GAME_PRICE,
        })
    ).to.be.revertedWith("ERC1155 balance not valid");
  });
  describe("When a game of first rank was created", () => {
    beforeEach(async () => {
      await createGame(
        env.bestOfGame,
        adr.gameCreator1,
        adr.gameMaster1.wallet.address,
        1
      );
    });
    it("GM is correct", async () => {
      expect(await env.bestOfGame.getGM(1)).to.be.equal(
        adr.gameMaster1.wallet.address
      );
    });
    it("Incremented number of games correctly", async () => {
      const state = await env.bestOfGame
        .connect(adr.gameCreator1.wallet)
        .getContractState();
      expect(state.BestOfState.numGames).to.be.equal(1);
    });
    it("Players cannot join until registration is open", async () => {
      await expect(
        env.bestOfGame.connect(adr.player1.wallet).joinGame(1)
      ).to.be.revertedWith("addPlayer->cant join now");
    });
    // it("Game creator can add join requirements", async () => {
    //   const requirement: IBestOf.TokenActionStruct = {
    //     token: {
    //       tokenAddress: env.mockERC20.address,
    //       tokenType: TokenTypes.ERC20,
    //       tokenId: 0,
    //     },
    //     amount: "1",
    //     requireParticularERC721: false,
    //     must: TokenMust.HAVE,
    //   };
    //   await expect(
    //     env.bestOfGame
    //       .connect(adr.gameCreator1.wallet)
    //       .addJoinRequirements(1, requirement)
    //   ).to.be.emit(env.bestOfGame, "RequirementAdded");
    // });
    it("Only game creator can open registration", async () => {
      await expect(
        env.bestOfGame.connect(adr.gameCreator1.wallet).openRegistration(1)
      ).to.be.emit(env.bestOfGame, "RegistrationOpen");
      await expect(
        env.bestOfGame.connect(adr.maliciousActor1.wallet).openRegistration(1)
      ).to.be.revertedWith("Only game creator");
    });
    describe("When registration was open without any additional requirements", () => {
      beforeEach(async () => {
        await env.bestOfGame
          .connect(adr.gameCreator1.wallet)
          .openRegistration(1);
      });
      // it("Mutating join requirements is no longer possible", async () => {
      //   const requirement: IBestOf.TokenActionStruct = {
      //     token: {
      //       tokenAddress: env.mockERC20.address,
      //       tokenType: TokenTypes.ERC20,
      //       tokenId: 0,
      //     },
      //     amount: "1",
      //     requireParticularERC721: false,
      //     must: TokenMust.HAVE,
      //   };
      //   await expect(
      //     env.bestOfGame
      //       .connect(adr.gameCreator1.wallet)
      //       .addJoinRequirements(1, requirement)
      //   ).to.be.revertedWith("Cannot do when registration is open");
      //   await expect(
      //     env.bestOfGame.connect(adr.gameCreator1.wallet).popJoinRequirements(1)
      //   ).to.be.revertedWith("Cannot do when registration is open");
      //   await expect(
      //     env.bestOfGame
      //       .connect(adr.gameCreator1.wallet)
      //       .removeJoinRequirement(1, 1)
      //   ).to.be.revertedWith("Cannot do when registration is open");
      // });
      it("Qualified players can join", async () => {
        await expect(
          env.bestOfGame
            .connect(adr.player1.wallet)
            .joinGame(1, { value: BOGSettings.BOG_JOIN_GAME_PRICE })
        ).to.be.emit(env.bestOfGame, "PlayerJoined");
      });
      it("Game cannot be started until join blocktime has passed", async () => {
        env.bestOfGame
          .connect(adr.player1.wallet)
          .joinGame(1, { value: BOGSettings.BOG_JOIN_GAME_PRICE });
        env.bestOfGame
          .connect(adr.player2.wallet)
          .joinGame(1, { value: BOGSettings.BOG_JOIN_GAME_PRICE });
        env.bestOfGame
          .connect(adr.player3.wallet)
          .joinGame(1, { value: BOGSettings.BOG_JOIN_GAME_PRICE });

        await expect(
          env.bestOfGame.connect(adr.player1.wallet).startGame(1)
        ).to.be.revertedWith("startGame->Still Can Join");
      });
      it("No more than max players can join", async () => {
        for (let i = 1; i < BOGSettings.BOG_MAX_PLAYERS + 1; i++) {
          let name = `player${i}` as any as keyof AdrSetupResult;
          env.bestOfGame
            .connect(adr[`${name}`].wallet)
            .joinGame(1, { value: BOGSettings.BOG_JOIN_GAME_PRICE });
        }
        await expect(
          env.bestOfGame.connect(adr.maliciousActor1.wallet).joinGame(1)
        ).to.be.revertedWith("addPlayer->party full");
      });
      it("Game cannot start too early", async () => {
        await expect(
          env.bestOfGame.connect(adr.gameMaster1.wallet).startGame(1)
        ).to.be.revertedWith("startGame->Still Can Join");
      });
      it("Game methods beside join and start are inactive", async () => {
        await expect(
          env.bestOfGame
            .connect(adr.gameMaster1.wallet)
            .submitProposal(
              1,
              ethers.utils.formatBytes32String("mockString"),
              ethers.utils.formatBytes32String("mockString"),
              ""
            )
        ).to.be.revertedWith("Game has not yet started");
        proposalsStruct = await mockProposals({
          players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
          gameId: 1,
          turn: 1,
          verifierAddress: env.bestOfGame.address,
        });
        votes = await mockVotes({
          gameId: 1,
          turn: 1,
          verifierAddress: env.bestOfGame.address,
          players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
          gm: adr.gameMaster1,
          proposals: proposalsStruct.map((item) => item.proposal),
          distribution: "semiUniform",
        });
        votersAddresses = getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS).map(
          (player) => player.wallet.address
        );
        await expect(
          env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
            1,
            getTurnSalt({ gameId: 1, turn: 1 }),
            votersAddresses,
            votes.map((vote) => vote.vote)
          )
        ).to.be.revertedWith("Game has not yet started");
        await expect(
          env.bestOfGame
            .connect(adr.gameMaster1.wallet)
            .submitVote(1, votes[0].voteHidden, votes[0].proof)
        ).to.be.revertedWith("Game has not yet started");
        await expect(
          env.bestOfGame.connect(adr.gameCreator1.wallet).openRegistration(1)
        ).to.be.revertedWith("Cannot do when registration is open");
        // await expect(
        //   env.bestOfGame
        //     .connect(adr.gameCreator1.wallet)
        //     .addJoinRequirements(1, {
        //       token: { tokenAddress: ZERO_ADDRESS, tokenType: 0, tokenId: 1 },
        //       amount: 1,
        //       must: 0,
        //       requireParticularERC721: false,
        //     })
        // ).to.be.revertedWith("Cannot do when registration is open");
        // await expect(
        //   env.bestOfGame
        //     .connect(adr.gameCreator1.wallet)
        //     .removeJoinRequirement(1, 0)
        // ).to.be.revertedWith("Cannot do when registration is open");
        // await expect(
        //   env.bestOfGame.connect(adr.gameCreator1.wallet).popJoinRequirements(1)
        // ).to.be.revertedWith("Cannot do when registration is open");
        await expect(
          env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
            1,
            getTurnSalt({ gameId: 1, turn: 1 }),
            votersAddresses,
            votes.map((vote) => vote.vote)
          )
        ).to.be.revertedWith("Game has not yet started");
      });
      it("Cannot be started if not enough players", async () => {
        await mineBlocks(BOGSettings.BOG_BLOCKS_TO_JOIN + 1);
        await expect(
          env.bestOfGame.connect(adr.gameMaster1.wallet).startGame(1)
        ).to.be.revertedWith("startGame->Not enough players");
      });
      describe("When there is minimal number and below maximum players in game", () => {
        beforeEach(async () => {
          await fillParty(
            getPlayers(adr, BOGSettings.BOG_MIN_PLAYERS),
            env.bestOfGame,
            1,
            false
          );
        });
        it("Can start game only after joining period is over", async () => {
          await expect(
            env.bestOfGame.connect(adr.gameMaster1.wallet).startGame(1)
          ).to.be.revertedWith("startGame->Still Can Join");
          await mineBlocks(BOGSettings.BOG_BLOCKS_TO_JOIN + 1);
          await expect(
            env.bestOfGame.connect(adr.gameMaster1.wallet).startGame(1)
          ).to.be.emit(env.bestOfGame, "GameStarted");
        });
        it("Game methods beside start are inactive", async () => {
          //TODO: add more methods here
          proposalsStruct = await mockProposals({
            players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
            gameId: 1,
            turn: 1,
            verifierAddress: env.bestOfGame.address,
          });
          await expect(
            env.bestOfGame
              .connect(adr.gameMaster1.wallet)
              .submitProposal(
                1,
                proposalsStruct[0].proposerHidden,
                proposalsStruct[0].proof,
                proposalsStruct[0].proposal
              )
          ).to.be.revertedWith("Game has not yet started");
          votes = await mockVotes({
            gameId: 1,
            turn: 1,
            verifierAddress: env.bestOfGame.address,
            players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
            gm: adr.gameMaster1,
            proposals: proposalsStruct.map((item) => item.proposal),
            distribution: "semiUniform",
          });
          votersAddresses = getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS).map(
            (player) => player.wallet.address
          );

          await expect(
            env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
              1,
              getTurnSalt({ gameId: 1, turn: 1 }),
              votersAddresses,
              votes.map((vote) => vote.vote)
            )
          ).to.be.revertedWith("Game has not yet started");
          await expect(
            env.bestOfGame
              .connect(adr.gameMaster1.wallet)
              .submitVote(1, votes[0].voteHidden, votes[0].proof)
          ).to.be.revertedWith("Game has not yet started");
        });
        describe("When game has started", () => {
          beforeEach(async () => {
            await startGame(1);
          });
          it("First turn has started", async () => {
            expect(
              await env.bestOfGame.connect(adr.player1.wallet).getTurn(1)
            ).to.be.equal(1);
          });
          it("Accepts only proposals and no votes", async () => {
            await expect(
              env.bestOfGame
                .connect(adr.gameMaster1.wallet)
                .submitProposal(
                  1,
                  proposalsStruct[0].proposerHidden,
                  proposalsStruct[0].proof,
                  proposalsStruct[0].proposal
                )
            ).to.be.emit(env.bestOfGame, "ProposalSubmitted");

            await expect(
              env.bestOfGame
                .connect(adr.player1.wallet)
                .submitVote(1, votes[0].voteHidden, votes[0].proof)
            ).to.be.revertedWith("No proposals exist at turn 1: cannot vote");
          });
          it("Processes only proposals only from game master", async () => {
            await expect(
              env.bestOfGame
                .connect(adr.gameMaster1.wallet)
                .submitProposal(
                  1,
                  proposalsStruct[0].proposerHidden,
                  proposalsStruct[0].proof,
                  proposalsStruct[0].proposal
                )
            ).to.emit(env.bestOfGame, "ProposalSubmitted");
            await expect(
              env.bestOfGame
                .connect(adr.maliciousActor1.wallet)
                .submitProposal(
                  1,
                  proposalsStruct[0].proposerHidden,
                  proposalsStruct[0].proof,
                  proposalsStruct[0].proposal
                )
            ).to.be.revertedWith("Only game master");
          });
          it("Can end turn if timeout reached with zero scores", async () => {
            await mineBlocks(BOGSettings.BOG_BLOCKS_PER_TURN + 1);
            await expect(
              env.bestOfGame
                .connect(adr.gameMaster1.wallet)
                .endTurn(1, getTurnSalt({ gameId: 1, turn: 1 }), [], [])
            )
              .to.be.emit(env.bestOfGame, "TurnEnded")
              .withArgs(
                1,
                1,
                getPlayers(adr, BOGSettings.BOG_MIN_PLAYERS).map(
                  (identity) => identity.wallet.address
                ),
                getPlayers(adr, BOGSettings.BOG_MIN_PLAYERS).map(() => 0),
                getTurnSalt({ gameId: 1, turn: 1 })
              );
          });
          describe("When all proposals received", () => {
            beforeEach(async () => {
              await mockValidProposals(
                getPlayers(adr, BOGSettings.BOG_MIN_PLAYERS),
                env.bestOfGame,
                adr.gameMaster1,
                1,
                true
              );
            });
            it("Can end turn", async () => {
              await expect(
                env.bestOfGame
                  .connect(adr.gameMaster1.wallet)
                  .endTurn(1, getTurnSalt({ gameId: 1, turn: 1 }), [], [])
              ).to.be.emit(env.bestOfGame, "TurnEnded");
            });
            describe("When first turn was made", () => {
              beforeEach(async () => {
                await env.bestOfGame
                  .connect(adr.gameMaster1.wallet)
                  .endTurn(1, getTurnSalt({ gameId: 1, turn: 1 }), [], []);
              });
              it("throws if player submitted GM signed vote for player voting himself", async () => {
                const badVote = await mockVote({
                  voter: adr.player1,
                  gm: adr.gameMaster1,
                  gameId: 1,
                  verifierAddress: env.bestOfGame.address,
                  turn: 2,
                  vote: [
                    proposalsStruct[0].proposal, // << - votes for himself
                    proposalsStruct[1].proposal,
                    proposalsStruct[2].proposal,
                  ],
                });
                // await env.bestOfGame
                //   .connect(adr.player1.wallet)
                //   .submitVote(1, badVote.voteHidden, badVote.proof);

                const badVotes = await mockVotes({
                  gameId: 1,
                  turn: 2,
                  verifierAddress: env.bestOfGame.address,
                  players: getPlayers(adr, BOGSettings.BOG_MIN_PLAYERS),
                  gm: adr.gameMaster1,
                  proposals: proposalsStruct.map((item) => item.proposal),
                  distribution: "semiUniform",
                });
                badVotes[0] = badVote;
                votersAddresses = getPlayers(
                  adr,
                  BOGSettings.BOG_MIN_PLAYERS
                ).map((player) => player.wallet.address);
                for (let i = 0; i < votersAddresses.length; i++) {
                  let name = `player${i + 1}` as any as keyof AdrSetupResult;
                  await env.bestOfGame
                    .connect(adr[`${name}`].wallet)
                    .submitVote(1, badVotes[i].voteHidden, badVotes[i].proof);
                }
                await mineBlocks(BOGSettings.BOG_BLOCKS_PER_TURN + 1);
                await expect(
                  env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
                    1,
                    getTurnSalt({ gameId: 1, turn: 2 }),
                    votersAddresses,
                    badVotes.map((vote) => vote.vote)
                  )
                ).to.be.revertedWith("voted for himself");
              });
              describe("When all players voted", () => {
                beforeEach(async () => {
                  await mockValidVotes(
                    getPlayers(adr, BOGSettings.BOG_MIN_PLAYERS),
                    env.bestOfGame,
                    1,
                    true
                  );
                });
                it("cannot end turn because players still have time to propose", async () => {
                  await expect(
                    env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
                      1,
                      getTurnSalt({ gameId: 1, turn: 2 }),
                      votersAddresses,
                      votes.map((vote) => vote.vote)
                    )
                  ).to.be.revertedWith(
                    "Some players still have time to propose"
                  );
                });
                it("Can end turn if timeout reached", async () => {
                  await mineBlocks(BOGSettings.BOG_BLOCKS_PER_TURN + 1);
                  expect(await env.bestOfGame.getTurn(1)).to.be.equal(2);
                  const expectedScores: number[] = [];
                  const players = getPlayers(
                    adr,
                    BOGSettings.BOG_MIN_PLAYERS
                  ).length;
                  for (let i = 0; i < players; i++) {
                    expectedScores[i] = 0;
                    votes.forEach((playerVote) => {
                      playerVote.vote.forEach((vote, idx) => {
                        if (proposalsStruct[i].proposal === vote) {
                          expectedScores[i] += 3 - idx;
                        }
                      });
                    });
                  }
                  await expect(
                    env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
                      1,
                      getTurnSalt({ gameId: 1, turn: 2 }),
                      votersAddresses,
                      votes.map((vote) => vote.vote)
                    )
                  )
                    .to.be.emit(env.bestOfGame, "TurnEnded")
                    .withArgs(
                      1,
                      2,
                      getPlayers(adr, BOGSettings.BOG_MIN_PLAYERS).map(
                        (identity) => identity.wallet.address
                      ),
                      expectedScores,
                      getTurnSalt({ gameId: 1, turn: 2 })
                    );
                });
              });
            });
          });
        });
        describe("When another game  of first rank is created", () => {
          beforeEach(async () => {
            await createGame(
              env.bestOfGame,
              adr.gameCreator1,
              adr.gameMaster2.wallet.address,
              1,
              true
            );
          });
          it("Reverts if players from another game tries to join", async () => {
            await expect(
              env.bestOfGame.connect(adr.player1.wallet).joinGame(2, {
                value: BOGSettings.BOG_GAME_PRICE,
              })
            ).to.be.revertedWith("addPlayer->Player in game");
            // env.bestOfGame.connect(adr.gameCreator1.wallet).joinGame(1, {
            //   value: BOGSettings.BOG_GAME_PRICE,
            // })
          });
        });
      });
      describe("When there is not enough players and join time is out", () => {
        beforeEach(async () => {
          await fillParty(
            getPlayers(adr, BOG_MIN_PLAYERS - 1),
            env.bestOfGame,
            1,
            true
          );
        });
        it("It throws on game start", async () => {
          await expect(
            env.bestOfGame.connect(adr.gameCreator1.wallet).startGame(1)
          ).to.be.revertedWith("startGame->Not enough players");
        });
        it("Allows creator can close the game", async () => {
          await expect(
            env.bestOfGame.connect(adr.gameCreator1.wallet).cancelGame(1)
          ).to.emit(env.bestOfGame, "GameClosed");
        });
        it("Allows player to leave the game", async () => {
          await expect(
            env.bestOfGame.connect(adr.player1.wallet).leaveGame(1)
          ).to.emit(env.bestOfGame, "PlayerLeft");
        });
      });
    });
    describe("When it is last turn and equal scores", () => {
      beforeEach(async () => {
        await runExistingUntilLastTurn(1, env.bestOfGame, adr.gameMaster1);
      });
      it("reverts on submit proposals", async () => {
        proposalsStruct = await mockProposals({
          players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
          gameId: 1,
          turn: BOGSettings.BOG_MAX_TURNS,
          verifierAddress: env.bestOfGame.address,
        });
        await expect(
          env.bestOfGame
            .connect(adr.gameMaster1.wallet)
            .submitProposal(
              1,
              proposalsStruct[0].proposerHidden,
              proposalsStruct[0].proof,
              proposalsStruct[0].proposal
            )
        ).to.be.revertedWith("Cannot propose in last turn");
      });
      it("Game is in overtime conditions", async () => {
        let isGameOver = await env.bestOfGame.isGameOver(1);
        expect(isGameOver).to.be.false;
        expect(await env.bestOfGame.isOvertime(1)).to.be.true;
      });
      it("emits game Over when submited votes result unique leaders", async () => {
        votes = await mockVotes({
          gameId: 1,
          turn: BOGSettings.BOG_MAX_TURNS,
          verifierAddress: env.bestOfGame.address,
          players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
          gm: adr.gameMaster1,
          proposals: proposalsStruct.map((item) => item.proposal),
          distribution: "ftw",
        });
        proposalsStruct = await mockProposals({
          players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
          gameId: 1,
          turn: BOGSettings.BOG_MAX_TURNS,
          verifierAddress: env.bestOfGame.address,
        });

        for (let i = 0; i < BOGSettings.BOG_MAX_PLAYERS; i++) {
          const currentTurn = await env.bestOfGame.getTurn(1);
          if (currentTurn.toNumber() !== BOGSettings.BOG_MAX_TURNS) {
            await env.bestOfGame
              .connect(adr.gameMaster1.wallet)
              .submitProposal(
                1,
                proposalsStruct[i].proposerHidden,
                proposalsStruct[i].proof,
                proposalsStruct[i].proposal
              );
          }
          let name = `player${i + 1}` as any as keyof AdrSetupResult;
          await env.bestOfGame
            .connect(adr[`${name}`].wallet)
            .submitVote(1, votes[i].voteHidden, votes[i].proof);
        }
        expect(
          await env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
            1,
            getTurnSalt({
              gameId: 1,
              turn: BOGSettings.BOG_MAX_TURNS,
            }),
            votersAddresses,
            votes.map((vote) => vote.vote)
          )
        ).to.emit(env.bestOfGame, "GameOver");
      });
      describe("When game is over", () => {
        beforeEach(async () => {
          votes = await mockVotes({
            gameId: 1,
            turn: BOGSettings.BOG_MAX_TURNS,
            verifierAddress: env.bestOfGame.address,
            players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
            gm: adr.gameMaster1,
            proposals: proposalsStruct.map((item) => item.proposal),
            distribution: "ftw",
          });
          proposalsStruct = await mockProposals({
            players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
            gameId: 1,
            turn: BOGSettings.BOG_MAX_TURNS,
            verifierAddress: env.bestOfGame.address,
          });

          for (let i = 0; i < BOGSettings.BOG_MAX_PLAYERS; i++) {
            const currentTurn = await env.bestOfGame.getTurn(1);
            if (currentTurn.toNumber() !== BOGSettings.BOG_MAX_TURNS) {
              await env.bestOfGame
                .connect(adr.gameMaster1.wallet)
                .submitProposal(
                  1,
                  proposalsStruct[i].proposerHidden,
                  proposalsStruct[i].proof,
                  proposalsStruct[i].proposal
                );
            }
            let name = `player${i + 1}` as any as keyof AdrSetupResult;
            await env.bestOfGame
              .connect(adr[`${name}`].wallet)
              .submitVote(1, votes[i].voteHidden, votes[i].proof);
          }
          await env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
            1,
            getTurnSalt({
              gameId: 1,
              turn: BOGSettings.BOG_MAX_TURNS,
            }),
            votersAddresses,
            votes.map((vote) => vote.vote)
          );
        });
        it("Throws on attempt to make another turn", async () => {
          const currentTurn = await env.bestOfGame.getTurn(1);
          votes = await mockVotes({
            gameId: 1,
            turn: currentTurn,
            verifierAddress: env.bestOfGame.address,
            players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
            gm: adr.gameMaster1,
            proposals: proposalsStruct.map((item) => item.proposal),
            distribution: "ftw",
          });
          proposalsStruct = await mockProposals({
            players: getPlayers(adr, BOGSettings.BOG_MAX_PLAYERS),
            gameId: 1,
            turn: currentTurn,
            verifierAddress: env.bestOfGame.address,
          });

          for (let i = 0; i < BOGSettings.BOG_MAX_PLAYERS; i++) {
            await expect(
              env.bestOfGame
                .connect(adr.gameMaster1.wallet)
                .submitProposal(
                  1,
                  proposalsStruct[i].proposerHidden,
                  proposalsStruct[i].proof,
                  proposalsStruct[i].proposal
                )
            ).to.be.revertedWith("Game over");

            let name = `player${i + 1}` as any as keyof AdrSetupResult;
            await expect(
              env.bestOfGame
                .connect(adr[`${name}`].wallet)
                .submitVote(1, votes[i].voteHidden, votes[i].proof)
            ).to.be.revertedWith("Game over");
          }
          await expect(
            env.bestOfGame.connect(adr.gameMaster1.wallet).endTurn(
              1,
              getTurnSalt({
                gameId: 1,
                turn: BOGSettings.BOG_MAX_TURNS,
              }),
              votersAddresses,
              votes.map((vote) => vote.vote)
            )
          ).to.be.revertedWith("Game over");
        });
        it("Gave rewards to winners", async () => {
          expect(
            await env.rankToken.balanceOf(adr.player1.wallet.address, 2)
          ).to.be.equal(1);
          expect(
            await env.rankToken.balanceOf(adr.player2.wallet.address, 1)
          ).to.be.equal(2);
          expect(
            await env.rankToken.balanceOf(adr.player2.wallet.address, 2)
          ).to.be.equal(0);
          expect(
            await env.rankToken.balanceOf(adr.player3.wallet.address, 1)
          ).to.be.equal(1);
          expect(
            await env.rankToken.balanceOf(adr.player3.wallet.address, 2)
          ).to.be.equal(0);
        });
        it("Allows winner to create game of next rank", async () => {
          await expect(
            env.bestOfGame
              .connect(adr.player1.wallet)
              ["createGame(address,uint256)"](
                adr.gameMaster1.wallet.address,
                2,
                {
                  value: BOGSettings.BOG_GAME_PRICE,
                }
              )
          ).to.emit(env.bestOfGame, "gameCreated");
        });
        describe("When game of next rank is created and opened", () => {
          beforeEach(async () => {
            await env.bestOfGame
              .connect(adr.player1.wallet)
              ["createGame(address,uint256)"](
                adr.gameMaster1.wallet.address,
                2,
                {
                  value: BOGSettings.BOG_GAME_PRICE,
                }
              );
            await env.bestOfGame
              .connect(adr.player1.wallet)
              .openRegistration(2);
          });
          it("Can be joined only by rank token bearers", async () => {
            await env.rankToken
              .connect(adr.player1.wallet)
              .setApprovalForAll(env.bestOfGame.address, true);
            await env.rankToken
              .connect(adr.player2.wallet)
              .setApprovalForAll(env.bestOfGame.address, true);
            await expect(env.bestOfGame.connect(adr.player1.wallet).joinGame(2))
              .to.emit(env.bestOfGame, "PlayerJoined")
              .withArgs(2, adr.player1.wallet.address);
            await expect(
              env.bestOfGame.connect(adr.player2.wallet).joinGame(2)
            ).to.revertedWith("ERC1155: insufficient balance for transfer");
          });
        });
      });
    });
  });
  describe("When there was multiple first rank games played so higher rank game can be filled", () => {
    //TODO: Test locking/unlocking a rank token here
  });
});
