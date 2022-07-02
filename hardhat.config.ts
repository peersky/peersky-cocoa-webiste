import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import "hardhat-diamond-abi";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import * as diamondUtils from "./utils/diamond";
import * as ipfsUtils from "./utils/ipfs";
import fs from "fs";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("upload2IPFS", "Uploads files to ipfs")
  .addParam("path", "file path")
  .setAction(async (taskArgs) => {
    const data = fs.readFileSync(taskArgs.path);
    await ipfsUtils.upload2IPFS(data);
  });

// task("register", "Registers participant")
//   .addParam("scoreBoard", "The board address")
//   .addParam("participant", "The participant address")
//   .setAction(async (taskArgs) => {
//     console.log("scoreBoard", taskArgs.scoreBoard);

//     const ScoreBoard = await ethers.getContractFactory("ScoreBoard");
//     const scoreBoard = await ScoreBoard.attach(`${taskArgs.scoreBoard}`);
//     await scoreBoard.registerParticipant(taskArgs.participant);
//   });

// task("getScoreboard", "Reads scoreboard")
//   .addParam("scoreBoard", "The board address")
//   .setAction(async (taskArgs) => {
//     console.log("scoreBoard", taskArgs.scoreBoard);

//     const ScoreBoard = await ethers.getContractFactory("ScoreBoard");
//     const scoreBoard = await ScoreBoard.attach(`${taskArgs.scoreBoard}`);
//     const scores = await scoreBoard.readScoreBoard();
//     console.log("Scores:", scores);
//   });

// task("setScore", "Reads scoreboard")
//   .addParam("scoreBoard", "The board address")
//   .addParam("participant", "The participant address")
//   .addParam("score", "score to set")
//   .setAction(async (taskArgs) => {
//     console.log("scoreBoard", taskArgs.scoreBoard);

//     const ScoreBoard = await ethers.getContractFactory("ScoreBoard");
//     const scoreBoard = await ScoreBoard.attach(`${taskArgs.scoreBoard}`);
//     const scores = await scoreBoard.updateScore(
//       taskArgs.participant,
//       taskArgs.score
//     );
//     console.log("Scores:", scores);
//   });

// const fs = require("fs");
// const privateKey = fs.readFileSync(".secrets/key.secret").toString().trim();

export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // accounts: { count: 30 },
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [process.env.PRIVATE_KEY && process.env.PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.8",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
    ],
  },
  diamondAbi: [
    {
      // (required) The name of your Diamond ABI
      name: "MultipassDiamond",
      include: ["DNSFacet", "OwnershipFacet", "DiamondLoupeFacet"],
      // We explicitly set `strict` to `true` because we want to validate our facets don't accidentally provide overlapping functions
      strict: true,
      // We use our diamond utils to filter some functions we ignore from the combined ABI
      filter(
        abiElement: unknown,
        index: number,
        abi: unknown[],
        fullyQualifiedName: string
      ) {
        // const changes = new diamondUtils.DiamondChanges();
        const signature = diamondUtils.toSignature(abiElement);
        return diamondUtils.isIncluded(fullyQualifiedName, signature);
      },
    },
    {
      name: "BestOfDiamond",
      include: ["BestOfFacet", "OwnershipFacet", "DiamondLoupeFacet"],
      strict: true,
      filter(
        abiElement: unknown,
        index: number,
        abi: unknown[],
        fullyQualifiedName: string
      ) {
        const signature = diamondUtils.toSignature(abiElement);
        return diamondUtils.isIncluded(fullyQualifiedName, signature);
      },
    },
  ],
  typechain: {
    outDir: "types/typechain",
    target: "ethers-v5",
    alwaysGenerateOverloads: true, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    // externalArtifacts: ["externalArtifacts/*.json"], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },

  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    clear: true,
    // flat: true,
    // only: [":ERC20$"],
    spacing: 2,
    pretty: true,
  },
};
