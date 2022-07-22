/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
/* eslint-disable no-await-in-loop */
// import { time } from "@openzeppelin/test-helpers";
import { contract, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  MultipassDiamond,
  BestOfDiamond,
} from "../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol";
import {
  MockERC1155,
  MockERC20,
  MockERC721,
} from "../types/typechain/contracts/mocks";
const {
  ZERO_ADDRESS,
  ZERO_BYTES32,
} = require("@openzeppelin/test-helpers/src/constants");
import { BigNumber, BigNumberish, Bytes, BytesLike, Wallet } from "ethers";
// @ts-ignore
import { deploy as deployMultipass } from "../scripts/deployMultipass";
import { deploy as deployRankToken } from "../scripts/deployRankToken";
import { deploy as deployBestOfGame } from "../scripts/deployBestOfGame";
import { LibMultipass } from "../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
import { RankToken } from "../types/typechain/contracts/tokens/RankToken";
import { BestOfInit } from "../types/typechain/contracts/initializers/BestOfInit";

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
  maliciousActor2: SignerIdentity;
  maliciousActor3: SignerIdentity;
  gameCreator1: SignerIdentity;
  gameCreator2: SignerIdentity;
  gameCreator3: SignerIdentity;
  gameMaster1: SignerIdentity;
  gameMaster2: SignerIdentity;
  gameMaster3: SignerIdentity;
  multipassOwner: SignerIdentity;
  gameOwner: SignerIdentity;
  registrar1: SignerIdentity;
}

export interface EnvSetupResult {
  multipass: MultipassDiamond;
  bestOfGame: BestOfDiamond;
  rankToken: RankToken;
  mockERC20: MockERC20;
  mockERC1155: MockERC1155;
  mockERC721: MockERC721;
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
  const createRandomIdentityAndSeedEth = async (name: string) => {
    let newWallet = await ethers.Wallet.createRandom();
    newWallet = newWallet.connect(ethers.provider);
    await _player1.sendTransaction({
      to: newWallet.address,
      value: ethers.utils.parseEther("1"),
    });

    const newIdentity: SignerIdentity = {
      wallet: newWallet,
      name: name,
      id: name + "-id",
    };
    return newIdentity;
  };

  const gameCreator1 = await createRandomIdentityAndSeedEth("gameCreator1");
  const gameCreator2 = await createRandomIdentityAndSeedEth("gameCreator2");
  const gameCreator3 = await createRandomIdentityAndSeedEth("gameCreator3");
  const multipassOwner = await createRandomIdentityAndSeedEth("multipassOwner");
  const registrar1 = await createRandomIdentityAndSeedEth("registrar1");
  const gameMaster1 = await createRandomIdentityAndSeedEth("GM1");
  const gameMaster2 = await createRandomIdentityAndSeedEth("GM2");
  const gameMaster3 = await createRandomIdentityAndSeedEth("GM3");
  const maliciousActor2 = await createRandomIdentityAndSeedEth(
    "MaliciousActor2"
  );
  const maliciousActor3 = await createRandomIdentityAndSeedEth(
    "MaliciousActor3"
  );
  const gameOwner = await createRandomIdentityAndSeedEth("gameOwner");

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
    gameMaster1,
    gameMaster2,
    gameMaster3,
    maliciousActor2,
    maliciousActor3,
    gameOwner,
  };
};

const baseFee = 1 * 10 ** 18;
const MULTIPASS_CONTRACT_NAME = "MultipassDNS";
export const MULTIPASS_CONTRACT_VERSION = "0.0.1";
const BESTOF_CONTRACT_NAME = "BESTOFNAME";
export const BESTOF_CONTRACT_VERSION = "0.0.1";
export const BOG_BLOCKS_PER_TURN = "14";
export const BOG_MAX_PLAYERS = 6;
export const BOG_MIN_PLAYERS = "3";
export const BOG_MAX_TURNS = "18";
export const BOG_BLOCKS_TO_JOIN = "200";
export const BOG_GAME_PRICE = ethers.utils.parseEther("0.001");
export const BOG_JOIN_GAME_PRICE = ethers.utils.parseEther("0.001");
export const BOG_JOIN_POLICY = 0;
export const BOGSettings = {
  BOG_BLOCKS_PER_TURN,
  BOG_MAX_PLAYERS,
  BOG_MIN_PLAYERS,
  BOG_MAX_TURNS,
  BOG_BLOCKS_TO_JOIN,
  BOG_GAME_PRICE,
  BOG_JOIN_GAME_PRICE,
  BOG_JOIN_POLICY,
  // BOG_NUM_ACTIONS_TO_TAKE,
};
export const setupEnvironment = async ({
  contractDeployer,
  multipassOwner,
  bestOfOwner,
}: {
  contractDeployer: SignerIdentity;
  multipassOwner: SignerIdentity;
  bestOfOwner: SignerIdentity;
}): Promise<EnvSetupResult> => {
  const multipassAddress = await deployMultipass({
    ownerAddress: multipassOwner.wallet.address,
    signer: contractDeployer.wallet,
    name: MULTIPASS_CONTRACT_NAME,
    version: MULTIPASS_CONTRACT_VERSION,
  });
  const multipass = (await ethers.getContractAt(
    "MultipassDiamond",
    multipassAddress
  )) as MultipassDiamond;

  if (!process.env.INFURA_URL || !process.env.RANK_TOKEN_PATH)
    throw new Error("Rank token IPFS route not exported");
  const rankTokenAddress = await deployRankToken({
    owner: contractDeployer.wallet.address,
    signer: contractDeployer.wallet,
    URI: process.env.INFURA_URL + process.env.RANK_TOKEN_PATH,
  });
  const rankToken = (await ethers.getContractAt(
    "RankToken",
    rankTokenAddress
  )) as RankToken;

  const bestOfInitialSettings: BestOfInit.ContractInitializerStruct = {
    blocksPerTurn: BOG_BLOCKS_PER_TURN,
    maxPlayersSize: BOG_MAX_PLAYERS,
    minPlayersSize: BOG_MIN_PLAYERS,
    rankTokenAddress: rankTokenAddress,
    blocksToJoin: BOG_BLOCKS_TO_JOIN,
    gamePrice: BOG_GAME_PRICE,
    joinGamePrice: BOG_JOIN_GAME_PRICE,
    maxTurns: BOG_MAX_TURNS,
  };

  const bestOfGameAddress = await deployBestOfGame({
    ownerAddress: bestOfOwner.wallet.address,
    signer: contractDeployer.wallet,
    version: BESTOF_CONTRACT_VERSION,
    name: BESTOF_CONTRACT_NAME,
    gameInitializer: bestOfInitialSettings,
  });

  const bestOfGame = (await ethers.getContractAt(
    "BestOfDiamond",
    bestOfGameAddress
  )) as BestOfDiamond;

  const MockERC20F = await ethers.getContractFactory(
    "MockERC20",
    contractDeployer.wallet
  );
  const mockERC20 = (await MockERC20F.deploy(
    "Mock ERC20",
    "MCK20",
    contractDeployer.wallet.address
  )) as MockERC20;
  await mockERC20.deployed();

  const MockERC1155F = await ethers.getContractFactory(
    "MockERC1155",
    contractDeployer.wallet
  );
  const mockERC1155 = (await MockERC1155F.deploy(
    "MOCKURI",
    contractDeployer.wallet.address
  )) as MockERC1155;
  await mockERC1155.deployed();

  const MockERC721F = await ethers.getContractFactory(
    "MockERC721",
    contractDeployer.wallet
  );
  const mockERC721 = (await MockERC721F.deploy(
    "Mock ERC721",
    "MCK721",
    contractDeployer.wallet.address
  )) as MockERC721;
  await mockERC721.deployed();

  // const {
  //   multipass,
  //   bestOfGame,
  //   rankToken,
  // }: {
  //   multipass: MultipassDiamond;
  //   bestOfGame: BestOfDiamond;
  //   rankToken: RankToken;
  // } = await deployAll.main({
  //   signer: contractDeployer.wallet,
  //   multipassOwner: multipassOwner.wallet.address,
  //   bestOfOwner: bestOfOwner.wallet.address,
  // });
  return {
    multipass,
    bestOfGame,
    rankToken,
    mockERC1155,
    mockERC20,
    mockERC721,
  };
};

interface ReferrerMesage {
  referrerAddress: string;
}
interface RegisterMessage {
  name: BytesLike;
  id: BytesLike;
  domainName: BytesLike;
  deadline: BigNumber;
  nonce: BigNumber;
}

type signatureMessage = ReferrerMesage | RegisterMessage;

export const signReferralCode = async (
  message: ReferrerMesage,
  verifierAddress: string,
  signer: SignerIdentity
) => {
  let { chainId } = await ethers.provider.getNetwork();

  const domain = {
    name: process.env.MULTIPASS_CONTRACT_NAME,
    version: process.env.MULTIPASS_CONTRACT_VERSION,
    chainId,
    verifyingContract: verifierAddress,
  };

  const types = {
    proofOfReferrer: [
      {
        type: "address",
        name: "referrerAddress",
      },
    ],
  };

  const s = await signer.wallet._signTypedData(domain, types, { ...message });
  return s;
};

export const signRegistrarMessage = async (
  message: RegisterMessage,
  verifierAddress: string,
  signer: SignerIdentity
) => {
  let { chainId } = await ethers.provider.getNetwork();

  const domain = {
    name: process.env.MULTIPASS_CONTRACT_NAME,
    version: process.env.MULTIPASS_CONTRACT_VERSION,
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

  const s = await signer.wallet._signTypedData(domain, types, { ...message });
  return s;
};

export default {
  setupAddresses,
  setupEnvironment,
  signMessage: signRegistrarMessage,
  addPlayerNameId,
  baseFee,
  CONTRACT_NAME: process.env.MULTIPASS_CONTRACT_NAME,
  CONTRACT_VERSION: process.env.MULTIPASS_CONTRACT_VERSION,
};

export async function mineBlocks(count: any) {
  for (let i = 0; i < count; i += 1) {
    await ethers.provider.send("evm_mine", []);
  }
}

export const getUserRegisterProps = async (
  account: SignerIdentity,
  registrar: SignerIdentity,
  domainName: string,
  deadline: number,
  multipassAddress: string,
  referrer?: SignerIdentity,
  referrerDomain?: string
) => {
  const registrarMessage = {
    name: ethers.utils.formatBytes32String(account.name + `.` + domainName),
    id: ethers.utils.formatBytes32String(account.id + `.` + domainName),
    domainName: ethers.utils.formatBytes32String(domainName),
    deadline: ethers.BigNumber.from(deadline),
    nonce: ethers.BigNumber.from(0),
  };

  const validSignature = await signRegistrarMessage(
    registrarMessage,
    multipassAddress,
    registrar
  );
  // const validSignature = ZERO_BYTES32;

  const applicantData: LibMultipass.RecordStruct = {
    name: ethers.utils.formatBytes32String(account.name + `.` + domainName),
    id: ethers.utils.formatBytes32String(account.id + `.` + domainName),
    wallet: account.wallet.address,
    nonce: 0,
    domainName: ethers.utils.formatBytes32String(domainName),
  };

  const referrerData: LibMultipass.NameQueryStruct = {
    name: ethers.utils.formatBytes32String(
      referrer?.name ? referrer?.name + `.` + domainName : ""
    ),
    domainName: ethers.utils.formatBytes32String(domainName),
    id: ethers.utils.formatBytes32String(""),
    wallet: ZERO_ADDRESS,
    targetDomain: ethers.utils.formatBytes32String(referrerDomain ?? ""),
  };
  let referrerSignature = ZERO_BYTES32;
  const proofOfReferrer: ReferrerMesage = {
    referrerAddress: referrer?.wallet.address ?? ZERO_ADDRESS,
  };
  if (referrer?.wallet.address) {
    referrerSignature = await signReferralCode(
      proofOfReferrer,
      multipassAddress,
      referrer
    );
  }

  return {
    registrarMessage,
    validSignature,
    applicantData,
    referrerData,
    referrerSignature,
  };
};

// interface VoteSubmittion {
//   gameId: string;
//   voterHidden: string;
//   votes: string[3];
//   proof: string;
// }

// const mockVote = ({
//   voter,
// }: {
//   voter: SignerIdentity;
//   gm: SignerIdentity;
//   voteText: string;
// }): VoteSubmittion => {
//   return

// };

export interface ProposalSubmittion {
  proposerHidden: string;
  proof: string;
  proposal: string;
}

interface ProposalMessage {
  gameId: BigNumberish;
  proposal: string;
  turn: BigNumberish;
  salt: BytesLike;
}

const ProposalTypes = {
  signHashedProposal: [
    {
      type: "uint256",
      name: "gameId",
    },
    {
      type: "uint256",
      name: "turn",
    },
    {
      type: "bytes32",
      name: "salt",
    },
    {
      type: "string",
      name: "proposal",
    },
  ],
};

export const signProposalMessage = async (
  message: ProposalMessage,
  verifierAddress: string,
  signer: SignerIdentity
) => {
  let { chainId } = await ethers.provider.getNetwork();

  const domain = {
    name: BESTOF_CONTRACT_NAME,
    version: BESTOF_CONTRACT_VERSION,
    chainId,
    verifyingContract: verifierAddress,
  };
  const s = await signer.wallet._signTypedData(domain, ProposalTypes, {
    ...message,
  });
  return s;
};

interface VoteMessage {
  vote1: string;
  vote2: string;
  vote3: string;
  gameId: BigNumberish;
  turn: BigNumberish;
  salt: BytesLike;
}
const VoteTypes = {
  signVote: [
    {
      type: "string",
      name: "vote1",
    },
    {
      type: "string",
      name: "vote2",
    },
    {
      type: "string",
      name: "vote3",
    },
    {
      type: "uint256",
      name: "gameId",
    },
    {
      type: "uint256",
      name: "turn",
    },
    {
      type: "bytes32",
      name: "salt",
    },
  ],
};

export const signVoteMessage = async (
  message: VoteMessage,
  verifierAddress: string,
  signer: SignerIdentity
) => {
  let { chainId } = await ethers.provider.getNetwork();

  const domain = {
    name: BESTOF_CONTRACT_NAME,
    version: BESTOF_CONTRACT_VERSION,
    chainId,
    verifyingContract: verifierAddress,
  };
  const s = await signer.wallet._signTypedData(domain, VoteTypes, {
    ...message,
  });
  return s;
};

const MOCK_SECRET = "123456";

export const getTurnSalt = ({
  gameId,
  turn,
}: {
  gameId: BigNumberish;
  turn: BigNumberish;
}) => {
  return ethers.utils.solidityKeccak256(
    ["string", "uint256", "uint256"],
    [MOCK_SECRET, gameId, turn]
  );
};

export const getTurnPlayersSalt = ({
  gameId,
  turn,
  player,
}: {
  gameId: BigNumberish;
  turn: BigNumberish;
  player: string;
}) => {
  return ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [player, getTurnSalt({ gameId, turn })]
  );
};

export const mockVote = async ({
  voter,
  gm,
  gameId,
  turn,
  vote,
  verifierAddress,
}: {
  voter: SignerIdentity;
  gameId: BigNumberish;
  turn: BigNumberish;
  gm: SignerIdentity;
  vote: [string, string, string];
  verifierAddress: string;
}): Promise<{
  proof: string;
  vote: [string, string, string];
  voteHidden: [BytesLike, BytesLike, BytesLike];
}> => {
  const playerSalt = getTurnPlayersSalt({
    gameId,
    turn,
    player: voter.wallet.address,
  });

  const message = {
    vote1: vote[0],
    vote2: vote[1],
    vote3: vote[2],
    gameId,
    turn,
    salt: playerSalt,
  };
  const voteHidden: [BytesLike, BytesLike, BytesLike] = [
    ethers.utils.solidityKeccak256(
      ["string", "bytes32"],
      [vote[0], playerSalt]
    ),
    ethers.utils.solidityKeccak256(
      ["string", "bytes32"],
      [vote[1], playerSalt]
    ),
    ethers.utils.solidityKeccak256(
      ["string", "bytes32"],
      [vote[2], playerSalt]
    ),
  ];
  const proof = await signVoteMessage(message, verifierAddress, gm);
  return { proof, vote, voteHidden };
};
export const getPlayers = (
  adr: AdrSetupResult,
  numPlayers: number
): [SignerIdentity, SignerIdentity, ...SignerIdentity[]] => {
  let players: SignerIdentity[] = [];
  for (let i = 1; i < numPlayers + 1; i++) {
    let name = `player${i}` as any as keyof AdrSetupResult;
    players.push(adr[`${name}`]);
  }
  return players as any as [
    SignerIdentity,
    SignerIdentity,
    ...SignerIdentity[]
  ];
};

export type MockVotes = Array<{
  proof: string;
  vote: [string, string, string];
  voteHidden: [BytesLike, BytesLike, BytesLike];
}>;

export const mockVotes = async ({
  gm,
  gameId,
  turn,
  proposals,
  verifierAddress,
  players,
}: {
  gameId: BigNumberish;
  turn: BigNumberish;
  gm: SignerIdentity;
  proposals: [...string[]];
  verifierAddress: string;
  players: [SignerIdentity, SignerIdentity, ...SignerIdentity[]];
}): Promise<MockVotes> => {
  const votes: Array<{
    proof: string;
    vote: [string, string, string];
    voteHidden: [BytesLike, BytesLike, BytesLike];
  }> = [];
  for (let k = 0; k < players.length; k++) {
    let firstSelected = (Number(gameId) + Number(turn) + k) % players.length;
    firstSelected =
      firstSelected == k ? (firstSelected + 1) % players.length : firstSelected;

    let secondSelected = (firstSelected + 1 * k) % players.length;
    while (secondSelected == k || firstSelected == secondSelected) {
      secondSelected = (secondSelected + 1) % players.length;
    }

    let thirdSelected = (secondSelected + 1 * k) % players.length;
    while (
      thirdSelected == k ||
      thirdSelected == secondSelected ||
      thirdSelected == firstSelected
    ) {
      thirdSelected = (thirdSelected + 1) % players.length;
    }

    const { vote, voteHidden, proof } = await mockVote({
      voter: players[k],
      gameId,
      turn,
      gm,
      verifierAddress,
      vote: [
        proposals[firstSelected],
        proposals[secondSelected],
        proposals[thirdSelected],
      ],
    });
    votes[k] = { vote, voteHidden, proof };
  }
  return votes;
};

export const mockProposalSecrets = async ({
  proposer,
  gameId,
  turn,
  verifierAddress,
}: {
  proposer: SignerIdentity;
  gameId: BigNumberish;
  turn: BigNumberish;
  verifierAddress: string;
}): Promise<ProposalSubmittion> => {
  const playerSalt = getTurnPlayersSalt({
    gameId,
    turn,
    player: proposer.wallet.address,
  });
  const proposerHidden = ethers.utils.solidityKeccak256(
    ["address", "bytes32"],
    [proposer.wallet.address, playerSalt]
  );
  const proposal = String(gameId) + String(turn) + proposer.id;
  const message = {
    gameId,
    proposal,
    turn,
    salt: playerSalt,
  };

  const s = await signProposalMessage(message, verifierAddress, proposer);

  return {
    proof: s,
    proposerHidden,
    proposal,
  };
};

export const mockProposals = async ({
  players,
  gameId,
  turn,
  verifierAddress,
}: {
  players: SignerIdentity[];
  gameId: BigNumberish;
  turn: BigNumberish;
  verifierAddress: string;
}) => {
  let proposals = [];
  for (let i = 0; i < players.length; i++) {
    let proposal = await mockProposalSecrets({
      proposer: players[i],
      gameId,
      turn,
      verifierAddress,
    });
    proposals.push(proposal);
  }
  return proposals;
};
