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
    .setName("open")
    .setDescription("open registrations a game")
    .addNumberOption((option) =>
      option.setName("game_id").setDescription("Game Id").setRequired(true)
    ),

  async execute(interaction) {
    const embed = new EmbedBuilder();
    const searchParams = new URLSearchParams("");
    searchParams.append("action", "open");
    searchParams.append("chainId", process.env.CHAIN_ID);
    searchParams.append("gameId", interaction.options.getNumber("game_id"));
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
