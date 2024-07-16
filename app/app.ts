import { Events, Client, GatewayIntentBits, Interaction } from 'discord.js';
import { config } from 'dotenv';
import commands from "./commands";

// Load .env 
config();

// TODO - PrismaClient 연결

const client = new Client({
  intents: [
    // GatewayIntentBits.Guilds,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ]
});

const startBot = async () => {
  await client.login(process.env.DISCORD_TOKEN);
  console.info("Discord bot is logged!");

  client.on(Events.ClientReady, async () => {
    console.log("Discord bot is ready! 🤖");
    if (client.application) {
      await client.application.commands.set(commands);
      console.log("info: command가 등록되었습니다.");
      console.log(`command 목록:`);
      commands.forEach((command) => {
        console.log(command.name);
      })
    }
  });
  
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      const currentCommand = commands.find(({name}) => name === interaction.commandName);
  
      if (currentCommand) {
        await interaction.deferReply();
        currentCommand.execute(client, interaction);
        console.log(`info: command ${currentCommand.name}이 실행되었습니다.`);
      }
    }
  })
};

startBot();