import Discord from "discord.js";
// const Discord = require("discord.js");
// const _MultipassJs = require("@daocoacoa/multipass-js");
// const MultipassJs = _MultipassJs.MultipassJs;
import { MultipassJs } from "@daocoacoa/multipass-js";
// const _ethers = require("ethers");
// const ethers = _ethers.ethers;
import { ethers } from "ethers";
import { MultipassDiamond } from "../../types/typechain/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond";
// const multipassAbi = require("../../abi/hardhat-diamond-abi/HardhatDiamondABI.sol/MultipassDiamond.json");
const multipassArtifactMumbai = require("../../deployments/mumbai/Multipass.json");
const { abi: multipassAbi, address: multipassAddress } =
  multipassArtifactMumbai;
if (!process.env.DISCORD_REGISTRAR_PRIVATE_KEY)
  throw new Error("no DISCORD_REGISTRAR_PRIVATE_KEY provided");
if (!process.env.RPC_URL) throw new Error("no RPC_URL provided");
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(
  process.env.DISCORD_REGISTRAR_PRIVATE_KEY,
  provider
);

const DOMAIN_NAME = "discord";
function wait(ms: any) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

if (!process.env.MULTIPASS_CONTRACT_NAME)
  throw new Error("process.env.MULTIPASS_CONTRACT_NAME not set");

if (!process.env.MULTIPASS_CONTRACT_VERSION)
  throw new Error("process.env.MULTIPASS_CONTRACT_VERSION not set");
const multipassJs = new MultipassJs({
  chainId: process.env.CHAIN_ID,
  contractName: process.env.MULTIPASS_CONTRACT_NAME,
  version: process.env.MULTIPASS_CONTRACT_VERSION,
});
const myIntents = new Discord.IntentsBitField();

myIntents.add("GuildMessages", "DirectMessages", "Guilds", "MessageContent");
const client = new Discord.Client({
  intents: myIntents,
  partials: [Discord.Partials.Channel],
});

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
  console.log(`Running provider as ${signer.address}`);
});
const multipass = new ethers.Contract(
  multipassAddress,
  multipassAbi,
  signer
) as MultipassDiamond;

const getMentionedIds = (msg: any) => {
  const mentionedIds: Array<any> = [];
  for (const [key, value] of msg.mentions.users) {
    console.log(`${key} goes ${value}`);
    mentionedIds.push(key);
  }
  return mentionedIds;
};
const signUp = async (msg: any) => {
  const channel = msg.channel;
  const username = msg.author.username + "#" + msg.author.discriminator;

  const query = multipassJs.formQueryByUsernameAndId({
    username: username,
    id: msg.author.id,
    domainName: DOMAIN_NAME,
  });
  const response = await multipass["resolveRecord"](query);
  console.log(JSON.stringify(response, null, 2));
  const readGas = await multipass.estimateGas.resolveRecord(query);
  console.log("Gas estimation: ", readGas.toString());
  if (response[0]) {
    channel.send(
      "you seem already to be registered: `" + response[1].wallet + "`"
    );
  } else {
    const deadline = (await provider.getBlockNumber()) + 1000;
    const registrarMessage = multipassJs.getRegistrarMessage({
      username,
      id: msg.author.id,
      domainName: DOMAIN_NAME,
      validUntil: deadline,
    });
    multipassJs
      .signRegistrarMessage(registrarMessage, multipassAddress, signer)
      .then((signature: any) => {
        if (!process.env.WEBURL) throw new Error("no WEBURL provided ");
        if (!process.env.MULTIPASS_ADDRESS) {
          channel.send("Please specify address: authenticate <address>");
        } else {
          const embed = new Discord.EmbedBuilder();
          embed.setURL(
            multipassJs.getDappURL(
              registrarMessage,
              signature,
              process.env.WEBURL + `/dapps/multipass/signup`,
              process.env.MULTIPASS_ADDRESS,
              DOMAIN_NAME
            )
          );
          embed
            .setDescription("This will take you to multipass registry website")
            .setTitle("Click to register");

          channel.send({ embeds: [embed] });
        }
      });
  }
};

const getRecord = async (msg: any) => {
  const args = msg.content.split(" ");
  const mentionedIds = getMentionedIds(msg);
  if (mentionedIds.length > 1) {
    const query = multipassJs.formQueryById({
      id: mentionedIds[1],
      domainName: DOMAIN_NAME,
    });
    const response = await multipass.resolveRecord(query);
    msg.reply(response[1].wallet);
  } else if (ethers.utils.isAddress(args[2].toLowerCase())) {
    const query = multipassJs.formQueryByAddress({
      address: args[2],
      domainName: DOMAIN_NAME,
    });
    const response = await multipass.resolveRecord(query);
    msg.reply("<@" + ethers.utils.parseBytes32String(response[1].id) + ">");
  } else {
    msg.reply("Arguments required:\n\t get <@mention> \n\t get <address>");
  }
};
client.on("messageCreate", async (msg: any) => {
  if (msg.author.bot) return;
  console.log(msg.content.startsWith("ping"));
  const channel = msg.channel;
  if (channel.type == Discord.ChannelType.DM) {
    //Only DM API
    if (msg.content.startsWith(`signup`)) {
      signUp(msg);
    }
  } else {
    //Only public API
  }
  //DM OR Public API
  if (msg.content === "ping") {
    msg.reply("pong");
  }
  if (msg.content.startsWith(`<@${client?.user?.id}> get`)) {
    getRecord(msg);
  }
  if (msg.content.startsWith(`registrar address`)) {
    msg.reply(`${signer.address}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
