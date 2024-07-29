import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { addSendrerChannel, getSenderChannelIds } from "@/db/queries/sender";

async function getTextChannels(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";
  const registeredChannelIds = await getSenderChannelIds(interaction.guildId!);

  const allChannels = Array.from(await interaction.guild.channels.fetch())
    .map(([, channel]) => channel)
    .filter((channel) => channel instanceof TextChannel)
    .filter((channel) => channel.name.includes(input))
    .filter((channel) => !registeredChannelIds.includes(channel.id));

  return interaction.respond(
    allChannels.map((channel) => ({
      name: channel.name,
      value: channel.id,
    }))
  );
}

@Discord()
@SlashGroup({
  name: "sender",
  description: "add, list, and delete sender channels",
})
@SlashGroup("sender")
export class Sender {
  @Slash({ name: "add", description: "add a sender channel" })
  async add(
    @SlashOption({
      name: "channel",
      description: "the channel to add as a sender",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getTextChannels,
    })
    channel: string,
    interaction: ChatInputCommandInteraction
  ) {
    if (!interaction.guildId) return;

    try {
      await addSendrerChannel(interaction.guildId, channel);
      await interaction.reply("successfully added sender channel!");
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return await interaction.reply("failed: channel already exists");
        } else {
          console.error(error);
          return await interaction.reply("failed: unknown error");
        }
      }
    }
  }
}
