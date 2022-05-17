require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-ethers");
require("@typechain/hardhat");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
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

const fs = require("fs");
const privateKey = fs.readFileSync(".secrets/key.secret").toString().trim();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // accounts: { count: 30 },
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: ["externalArtifacts/*.json"], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },
};
