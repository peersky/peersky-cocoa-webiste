/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-await-in-loop */
// import { time } from "@openzeppelin/test-helpers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MultipassDiamond } from "../types/hardhat-diamond-abi/";

import { BigNumber, BytesLike, Wallet } from "ethers";
// @ts-ignore
import { deploySequence } from "../scripts/deploy.js";
export interface SignerIdentity {
  name: string;
  id: string;
  wallet: Wallet | SignerWithAddress;
}
export interface AdrSetupResult {
  contractDeployer: SignerIdentity;
  player1: SignerIdentity;
  player2: SignerIdentity;
  player3: SignerIdentity;
  player4: SignerIdentity;
  player5: SignerIdentity;
  player6: SignerIdentity;
  player7: SignerIdentity;
  player8: SignerIdentity;
  player9: SignerIdentity;
  player10: SignerIdentity;
  player11: SignerIdentity;
  player12: SignerIdentity;
  player13: SignerIdentity;
  player14: SignerIdentity;
  player15: SignerIdentity;
  player16: SignerIdentity;
  player17: SignerIdentity;
  player18: SignerIdentity;
  maliciousActor1: SignerIdentity;
  gameCreator1: SignerIdentity;
  gameCreator2: SignerIdentity;
  gameCreator3: SignerIdentity;
  multipassOwner: SignerIdentity;
  registrar1: SignerIdentity;
}

export interface EnvSetupResult {
  multipass: MultipassDiamond;
}
export const addPlayerNameId = (idx: any) => {
  return { name: `player-${idx}`, id: `player-${idx}-id` };
};

export const setupAddresses = async (): Promise<AdrSetupResult> => {
  const [
    _contractDeployer,
    _player1,
    _player2,
    _player3,
    _player4,
    _player5,
    _player6,
    _player7,
    _player8,
    _player9,
    _player10,
    _player11,
    _player12,
    _player13,
    _player14,
    _player15,
    _player16,
    _player17,
    _player18,
    _maliciousActor1,
  ] = await ethers.getSigners();

  let _gameCreator1 = await ethers.Wallet.createRandom();
  _gameCreator1 = _gameCreator1.connect(ethers.provider);
  await _player1.sendTransaction({
    to: _gameCreator1.address,
    value: ethers.utils.parseEther("1"),
  });
  let _gameCreator2 = ethers.Wallet.createRandom();
  _gameCreator2 = _gameCreator2.connect(ethers.provider);
  await _contractDeployer.sendTransaction({
    to: _gameCreator2.address,
    value: ethers.utils.parseEther("1"),
  });
  let _gameCreator3 = ethers.Wallet.createRandom();
  _gameCreator3 = _gameCreator3.connect(ethers.provider);
  await _contractDeployer.sendTransaction({
    to: _gameCreator3.address,
    value: ethers.utils.parseEther("1"),
  });

  let _multipassOwner = ethers.Wallet.createRandom();
  _multipassOwner = _multipassOwner.connect(ethers.provider);
  await _contractDeployer.sendTransaction({
    to: _multipassOwner.address,
    value: ethers.utils.parseEther("1"),
  });

  let _registrar1 = ethers.Wallet.createRandom();
  _registrar1 = _registrar1.connect(ethers.provider);
  await _contractDeployer.sendTransaction({
    to: _multipassOwner.address,
    value: ethers.utils.parseEther("1"),
  });

  await _contractDeployer.sendTransaction({
    to: _registrar1.address,
    value: ethers.utils.parseEther("1"),
  });

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  // const DNS_REGISTRAR_ADDRESS = process.env.BOT_ADDRESS;
  // if (!DNS_REGISTRAR_ADDRESS) throw "BOT_ADDRESS not exported!";

  const contractDeployer: SignerIdentity = {
    wallet: _contractDeployer,
    name: "contractDeployer",
    id: "contractDeployer-id",
  };
  const player1: SignerIdentity = {
    wallet: _player1,
    name: "player1",
    id: "player1-id",
  };
  const player2: SignerIdentity = {
    wallet: _player2,
    name: "player2",
    id: "player2-id",
  };
  const player3: SignerIdentity = {
    wallet: _player3,
    name: "player3",
    id: "player3-id",
  };
  const player4: SignerIdentity = {
    wallet: _player4,
    name: "player4",
    id: "player4-id",
  };
  const player5: SignerIdentity = {
    wallet: _player5,
    name: "player5",
    id: "player5-id",
  };
  const player6: SignerIdentity = {
    wallet: _player6,
    name: "player6",
    id: "player6-id",
  };
  const player7: SignerIdentity = {
    wallet: _player7,
    name: "player7",
    id: "player7-id",
  };
  const player8: SignerIdentity = {
    wallet: _player8,
    name: "player8",
    id: "player8-id",
  };
  const player9: SignerIdentity = {
    wallet: _player9,
    name: "player9",
    id: "player9-id",
  };
  const player10: SignerIdentity = {
    wallet: _player10,
    name: "player10",
    id: "player10-id",
  };
  const player11: SignerIdentity = {
    wallet: _player11,
    name: "player11",
    id: "player11-id",
  };
  const player12: SignerIdentity = {
    wallet: _player12,
    name: "player12",
    id: "player12-id",
  };
  const player13: SignerIdentity = {
    wallet: _player13,
    name: "player13",
    id: "player13-id",
  };
  const player14: SignerIdentity = {
    wallet: _player14,
    name: "player14",
    id: "player14-id",
  };
  const player15: SignerIdentity = {
    wallet: _player15,
    name: "player15",
    id: "player15-id",
  };
  const player16: SignerIdentity = {
    wallet: _player16,
    name: "player16",
    id: "player16-id",
  };
  const player17: SignerIdentity = {
    wallet: _player17,
    name: "player17",
    id: "player17-id",
  };
  const player18: SignerIdentity = {
    wallet: _player18,
    name: "player18",
    id: "player18-id",
  };
  const maliciousActor1: SignerIdentity = {
    wallet: _maliciousActor1,
    name: "maliciousActor1",
    id: "maliciousActor1-id",
  };
  const gameCreator1: SignerIdentity = {
    wallet: _gameCreator1,
    name: "gameCreator1",
    id: "gameCreator1-id",
  };
  const gameCreator2: SignerIdentity = {
    wallet: _gameCreator2,
    name: "gameCreator2",
    id: "gameCreator2-id",
  };
  const gameCreator3: SignerIdentity = {
    wallet: _gameCreator3,
    name: "gameCreator3",
    id: "gameCreator3-id",
  };
  const multipassOwner: SignerIdentity = {
    wallet: _multipassOwner,
    name: "multipassOwner",
    id: "multipassOwner-id",
  };
  const registrar1: SignerIdentity = {
    wallet: _registrar1,
    name: "registrar",
    id: "registrar-id",
  };

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
    registrar1,
  };
};

const baseFee = 1 * 10 ** 18;
const CONTRACT_NAME = "MultipassDNS";
const CONTRACT_VERSION = "0.0.1";

export const setupEnvironment = async (
  contractDeployer: SignerIdentity,
  contractOwner: SignerIdentity
) => {
  const address = await deploySequence(
    contractDeployer.wallet,
    contractOwner.wallet.address,
    CONTRACT_VERSION,
    CONTRACT_NAME,
    ["DiamondLoupeFacet", "OwnershipFacet"],
    "MultipassInit"
  );

  const multipass = (await ethers.getContractAt(
    "MultipassDiamond",
    address
  )) as MultipassDiamond;
  return {
    multipass,
  };
};

interface signatureMessage {
  name: BytesLike;
  id: BytesLike;
  domainName: BytesLike;
  deadline: BigNumber;
  nonce: BigNumber;
}
export const signMessage = async (
  message: signatureMessage,
  verifierAddress: string,
  signer: SignerIdentity
) => {
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
        type: "bytes32",
        name: "name",
      },
      {
        type: "bytes32",
        name: "id",
      },
      {
        type: "bytes32",
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

  const s = await signer.wallet._signTypedData(domain, types, message);
  return s;
};

export default {
  setupAddresses,
  setupEnvironment,
  signMessage,
  addPlayerNameId,
  baseFee,
  CONTRACT_NAME,
  CONTRACT_VERSION,
};
