import { getSenderChannels } from "@/db/queries/sender";
import { ChatInputCommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";

@Discord()
@SlashGroup("sender")
export class Sender {
  @Slash({ name: "list", description: "list a sender channel" })
  async list(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const channels = await getSenderChannels(interaction.guildId!, interaction);

    if (!channels.length) {
      return await interaction.reply("no sender channels found");
    }

    await interaction.reply(
      channels.map((channel) => `<#${channel.id}>`).join("\n")
    );
  }
}