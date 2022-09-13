import Discord from "discord.js";
// const Discord = require("discord.js");
// const _MultipassJs = require("@daocoacoa/multipass-js");
// const MultipassJs = _MultipassJs.MultipassJs;
import { MultipassJs } from "@daocoacoa/multipass-js";
// const _ethers = require("ethers");
// const ethers = _ethers.ethers;
import { ethers } from "ethers";
if (!process.env.PRIVATE_KEY) throw new Error("no PRIVATE_KEY provided");
if (!process.env.RPC_URL) throw new Error("no RPC_URL provided");

const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

function wait(ms: any) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

// wait(7000);
// console.log("provider", provider);
// if (!provider.network) throw new Error("WTF?");
const multipassJs = new MultipassJs(process.env.CHAIN_ID);
const myIntents = new Discord.IntentsBitField();

myIntents.add("GuildMessages", "DirectMessages", "Guilds", "MessageContent");
const client = new Discord.Client({
  intents: myIntents,
  partials: [Discord.Partials.Channel],
});

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});
client.on("messageCreate", async (msg: any) => {
  if (!process.env.MULTIPASS_ADDRESS)
    throw new Error("no MULTIPASS_ADDRESS provided");

  if (msg.author.bot) return;
  console.log(msg.content.startsWith("ping"));
  const channel = msg.channel;
  if (channel.type == Discord.ChannelType.DM) {
    if (msg.content.startsWith(`authenticate`)) {
      const args = msg.content.split(" ");
      const address = args[1];
      if (ethers.utils.isAddress(address)) {
        const username = msg.author.username + "#" + msg.author.discriminator;
        console.log("trying to get deadline");
        const deadline = (await provider.getBlockNumber()) + 1000;
        console.log("is Address", deadline);
        const registrarMessage = {
          name: ethers.utils.formatBytes32String(
            msg.author.username + "#" + msg.author.discriminator
          ),
          id: ethers.utils.formatBytes32String(msg.author.id),
          domainName: ethers.utils.formatBytes32String("discord"),
          deadline: ethers.BigNumber.from(deadline),
          nonce: ethers.BigNumber.from(0),
        };
        multipassJs
          .signRegistrarMessage(
            registrarMessage,
            process.env.MULTIPASS_ADDRESS,
            signer
          )
          .then((signature: any) => {
            if (!process.env.WEBURL) throw new Error("no WEBURL provided ");
            if (!process.env.MULTIPASS_ADDRESS) {
              channel.send("Please specify address: authenticate <address>");
            } else {
              channel.send(
                "authentication link: " +
                  multipassJs.getDappURL(
                    registrarMessage,
                    signature,
                    process.env.WEBURL,
                    process.env.MULTIPASS_ADDRESS,
                    "discord"
                  )
              );
            }
          });
      } else {
        channel.send("Invalid address");
        msg.reply("pooong");
      }
    }
  } else {
    if (msg.content === "ping") {
      msg.reply("pong");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
