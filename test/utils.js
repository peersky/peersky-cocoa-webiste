/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-await-in-loop */
const { time } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");

const setupAddresses = async () => {
  const [
    contractDeployer,
    player1,
    player2,
    player3,
    player4,
    player5,
    player6,
    player7,
    player8,
    player9,
    player10,
    player11,
    player12,
    player13,
    player14,
    player15,
    player16,
    player17,
    player18,
    maliciousActor1,
  ] = await ethers.getSigners();

  let gameCreator1 = await ethers.Wallet.createRandom();
  gameCreator1 = gameCreator1.connect(ethers.provider);
  await player1.sendTransaction({
    to: gameCreator1.address,
    value: ethers.utils.parseEther("1"),
  });
  let gameCreator2 = ethers.Wallet.createRandom();
  gameCreator2 = gameCreator2.connect(ethers.provider);
  await contractDeployer.sendTransaction({
    to: gameCreator2.address,
    value: ethers.utils.parseEther("1"),
  });
  let gameCreator3 = ethers.Wallet.createRandom();
  gameCreator3 = gameCreator3.connect(ethers.provider);
  await contractDeployer.sendTransaction({
    to: gameCreator3.address,
    value: ethers.utils.parseEther("1"),
  });
  let multipassOwner = ethers.Wallet.createRandom();
  multipassOwner = multipassOwner.connect(ethers.provider);
  await contractDeployer.sendTransaction({
    to: multipassOwner.address,
    value: ethers.utils.parseEther("1"),
  });

  let registrar1 = ethers.Wallet.createRandom();
  registrar1 = registrar1.connect(ethers.provider);
  await contractDeployer.sendTransaction({
    to: multipassOwner.address,
    value: ethers.utils.parseEther("1"),
  });

  await contractDeployer.sendTransaction({
    to: registrar1.address,
    value: ethers.utils.parseEther("1"),
  });

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  // const DNS_REGISTRAR_ADDRESS = process.env.BOT_ADDRESS;
  // if (!DNS_REGISTRAR_ADDRESS) throw "BOT_ADDRESS not exported!";

  return {
    contractDeployer,
    player1,
    player2,
    player3,
    player4,
    player5,
    player6,
    player7,
    player8,
    player9,
    player10,
    player11,
    player12,
    player13,
    player14,
    player15,
    player16,
    player17,
    player18,
    maliciousActor1,
    gameCreator1,
    gameCreator2,
    gameCreator3,
    multipassOwner,
    registrar: registrar1,
    ZERO_ADDRESS,
  };
};

const baseFee = 1 * 10 ** 18;
const CONTRACT_NAME = "Multipass";
const CONTRACT_VERSION = "0.0.1";

const setupEnvironment = async (contractDeployer, contractOwner) => {
  const Multipass = await ethers.getContractFactory("Multipass");
  const multipass = await Multipass.connect(contractDeployer).deploy(
    contractOwner.address,
    CONTRACT_NAME,
    CONTRACT_VERSION
  );

  return {
    multipass,
  };
};

// const setupToken = async (
//   supply,
//   name,
//   symbol,
//   initialHolder,
//   admin,
//   backupAdmin,
//   lockPeriod,
//   controller
// ) => {
//   const token = await ethers.getContractFactory("LERC20");

//   const deployedToken = await token
//     .connect(initialHolder)
//     .deploy(supply, name, symbol, admin, backupAdmin, lockPeriod, controller);

//   return deployedToken;
// };

const signMessage = async (message, verifierAddress, signer) => {
  // console.log("signMessage");
  let { chainId } = await ethers.provider.getNetwork();

  const domain = {
    name: CONTRACT_NAME,
    version: CONTRACT_VERSION,
    chainId,
    verifyingContract: verifierAddress,
  };

  const types = {
    registerName: [
      {
        type: "string",
        name: "name",
      },
      {
        type: "string",
        name: "id",
      },
      {
        type: "string",
        name: "domainName",
      },
      {
        type: "uint256",
        name: "deadline",
      },
      {
        type: "uint96",
        name: "nonce",
      },
    ],
  };

  const s = await signer._signTypedData(domain, types, message);
  return s;
};

module.exports = {
  setupAddresses,
  setupEnvironment,
  signMessage,
  baseFee,
  CONTRACT_NAME,
  CONTRACT_VERSION,
};
