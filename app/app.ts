import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';

// Load .env 
config();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ],
});

client.once('ready', () => {
    console.log("Discord bot is ready! 🤖");
});

client.on('messageCreate', message => {
  if (message.content === 'ping') {
      message.channel.send('pong');
  }
});

client.on('error', err => {
  console.error('Error: ', err);
})

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Failed to login: ', err)
});