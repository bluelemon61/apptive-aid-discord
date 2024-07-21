import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class PingCommand {
  @Slash({ name: "ping", description: "Reply with Pong!" })
  ping(interaction: CommandInteraction) {
    interaction.reply("Pong!");
  }
}
