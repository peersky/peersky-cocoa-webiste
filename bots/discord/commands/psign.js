const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const ethers = require("ethers");
const besofgame = require("@daocoacoa/bestofgame-js");
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
// while (!provider.network?.chainId) {}
const signer = new ethers.Wallet(
  process.env.DISCORD_REGISTRAR_PRIVATE_KEY,
  provider
);
const Multipass = require("@daocoacoa/multipass-js");
const multipass = new Multipass.default({
  chainId: process.env.CHAIN_ID,
  contractName: process.env.MULTIPASS_CONTRACT_NAME,
  version: process.env.MULTIPASS_CONTRACT_VERSION,
});

const multipassArtifactMumbai = require("../../../deployments/mumbai/Multipass.json");
const { abi: multipassAbi, address: multipassAddress } =
  multipassArtifactMumbai;

const multipassContract = new ethers.Contract(
  multipassAddress,
  multipassAbi,
  signer
);

const chains = {
  ethereum: {
    chainId: 1,
    name: "ethereum",
    rpcs: ["https://mainnet.infura.io/v3/"],
  },
  goerli: {
    chainId: 5,
    name: "goerli",
    rpcs: ["https://goerli.infura.io/v3/"],
  },
  localhost: {
    chainId: 1337,
    name: "localhost",
    rpcs: ["http://localhost:8545"],
  },
  mumbai: {
    chainId: 80001,
    name: "mumbai",
    rpcs: [
      "https://rpc-mumbai.matic.today",
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
  },
  polygon: {
    chainId: 137,
    name: "polygon",
    rpcs: [
      "https://polygon-rpc.com",
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
    ],
  },
};

const getChainFromId = (chainId) => {
  const [chainName] =
    Object.entries(chains).find(([chainName, chain]) => {
      if (chain.chainId == chainId) return true;
    }) ?? [];
  if (!chainName) throw new Error("chain id is not found");
  return chainName;
};
// };
// const isKnownChain = (_chainId) => {
//   return Object.keys(chains).some((key) => {
//     return chains[key].chainId == _chainId;
//   });
// };
// const _n = await provider.getNetwork();
console.dir(provider.network);
const GameMaster = new besofgame.GameMaster({
  EIP712name: "BestOfGame",
  EIP712Version: "0.0.1",
  chainId: "80001",
  signer: signer,
});
if (!process.env.WEBURL) throw new Error("WEBURL not set");
const dappsURL = process.env.WEBURL + "dapps/";
const bestOfWebURL = dappsURL + "bestofweb/";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("psign")
    .options({ setTimeout})
    .setDescription("creates an link to signing a proposal")
    .addNumberOption((option) =>
      option.setName("game_id").setDescription("Game Id").setRequired(true)
    ),
  async execute(interaction) {
    console.log("processing psign..");
    const gameId = interaction.options.getNumber("game_id");
    const embed = new EmbedBuilder();
    const searchParams = new URLSearchParams("");
    searchParams.append("action", "psign");
    searchParams.append("chainId", process.env.CHAIN_ID);
    searchParams.append("gameId", gameId);
    const chainName = getChainFromId(process.env.CHAIN_ID);
    // const gameState = await besofgame.getGameState();
    const _turn = await besofgame.getCurrentTurn(chainName, provider, gameId);
    const turn = _turn.toString();
    console.log("got turn:", turn);
    const [isResolved, record] = await multipassContract["resolveRecord"](
      multipass.formQueryById({
        id: interaction.user.id,
        domainName: "discord",
      })
    );
    const proposerAddress = record.wallet;
    console.log("proposerAddress", proposerAddress);
    // const signature = GameMaster.signProposalMessage({
    //   gameId,
    //   turn: turn.currentTurn.toString(),
    //   gameId: interaction.options.getNumber("game_id"),
    //   proposer: proposerAddress,
    // });
    searchParams.append(
      "playerSalt",
      GameMaster.getTurnPlayersSalt({ gameId, turn, proposer: proposerAddress })
    );
    // searchParams.append("gameContract", "TODO!");
    embed.setURL(`${bestOfWebURL}?${searchParams.toString()}`);
    embed
      .setDescription(
        "By opening registration you allow anyone who can fulfill requirements to join your game until it's full"
      )
      .setTitle("Press to open registration game");

    interaction.reply({ embeds: [embed] });
  },
};
