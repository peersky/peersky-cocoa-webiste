import Discord from "discord.js";
const myIntents = new Discord.IntentsBitField();
myIntents.add("GuildMessages", "DirectMessages", "Guilds", "MessageContent");
const client = new Discord.Client({
  intents: myIntents,
  partials: [Discord.Partials.Channel],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  console.log(msg.content.startsWith("ping"));
  const channel = msg.channel;
  if (channel.type == Discord.ChannelType.DM) {
    if (msg.content.startsWith(`authenticate`)) {
      const args = message.content.split(" ");
      const address = args[1];
      if (web3.isAddress(address)) {
        username = message.author.name + "#" + message.author.discriminator;
        channel.send(
          "authentication link: " +
            get_dapp_signer_url(
              get_message_to_sign(username, address),
              address,
              username
            )
        );
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
