import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { getSenderChannels } from "@/db/queries/sender";

async function getSendChannels(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";
  const channels = await getSenderChannels(interaction.guildId!, interaction);

  return interaction.respond(
    channels
      .filter((channel) => channel.name.includes(input))
      .map((channel) => ({
        name: channel.name,
        value: channel.id,
      }))
  );
}

@Discord()
@SlashGroup("sender")
export class Sender {
  @Slash({ name: "delete", description: "delete a sender channel" })
  async delete(
    @SlashOption({
      name: "channel",
      description: "the channel to delete as a sender",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getSendChannels,
    })
    interaction: ChatInputCommandInteraction
  ) {
    await interaction.reply("delete a sender channel");
  }
}
