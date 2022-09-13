import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import "hardhat-diamond-abi";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import { toSignature, isIncluded } from "./utils/diamond";
import * as ipfsUtils from "./utils/ipfs";
import fs from "fs";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
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

task("uploadDir2IPFS", "Uploads directory to ipfs")
  .addParam("path", "path")
  .setAction(async (taskArgs) => {
    await ipfsUtils.uploadDir2IPFS(taskArgs.path);
  });

export default {
  gasReporter: {
    currency: "EUR",
    gasPrice: 21,
    enabled: false,
    coinmarketcap: process.env.COINMARKETCAP_KEY,
  },
  defaultNetwork: "hardhat",
  networks: {
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [process.env.PRIVATE_KEY && process.env.PRIVATE_KEY],
    },
    matic: {
      url: process.env.MATIC_MAINNET_URL ?? "",
      accounts: [process.env.PRIVATE_KEY && process.env.PRIVATE_KEY],
    },
    ganache: {
      url: process.env.RPC_URL ?? "",
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
        const signature = toSignature(abiElement);
        return isIncluded(fullyQualifiedName, signature);
      },
    },
    {
      name: "BestOfDiamond",
      include: [
        "BestOfFacet",
        "OwnershipFacet",
        "DiamondLoupeFacet",
        "RequirementsFacet",
        "GameMastersFacet",
      ],
      strict: true,
      filter(
        abiElement: unknown,
        index: number,
        abi: unknown[],
        fullyQualifiedName: string
      ) {
        const signature = toSignature(abiElement);
        return isIncluded(fullyQualifiedName, signature);
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
    format: "fullName",
    // flat: true,
    // only: [":ERC20$"],
    spacing: 2,
    pretty: false,
  },
};
