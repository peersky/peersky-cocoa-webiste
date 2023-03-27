const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const ethers = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(
  process.env.DISCORD_REGISTRAR_PRIVATE_KEY,
  provider
);
if (!process.env.WEBURL) throw new Error("WEBURL not set");
const dappsURL = process.env.WEBURL + "dapps/";
const bestOfWebURL = dappsURL + "bestofweb/";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("newgame")
    .setDescription("Creates new game"),
  // .addStringOption((option) =>
  //   option
  //     .setName("input")
  //     .setDescription("The input to echo back")
  //     .setRequired(true)
  // )
  // .addStringOption((option) =>
  //   option
  //     .setName("category")
  //     .setDescription("The gif category")
  //     .setRequired(true)
  //     .addChoices(
  //       { name: "Funny", value: "gif_funny" },
  //       { name: "Meme", value: "gif_meme" },
  //       { name: "Movie", value: "gif_movie" }
  //     )
  // ),
  async execute(interaction) {
    const embed = new EmbedBuilder();
    const searchParams = new URLSearchParams("");
    searchParams.append("action", "newGame");
    searchParams.append("chainId", process.env.CHAIN_ID);
    searchParams.append("GM", signer.address);
    // searchParams.append("gameContract", "TODO!");
    embed.setURL(`${bestOfWebURL}?${searchParams.toString()}`);
    embed
      .setDescription(
        "Clicking this will forward you to dApp where you can create game"
      )
      .setTitle("Press to create new game");

    interaction.reply({ embeds: [embed] });
    // await interaction.reply("YoPong!!");
  },
};
