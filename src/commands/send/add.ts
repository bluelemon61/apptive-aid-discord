import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { addSendrerChannel, getSenderChannelIds } from "@/db/queries/sender";

async function getTextChannels(interaction: Interaction, query: string = "") {
  const registeredChannelIds = await getSenderChannelIds(interaction.guildId!);

  return Array.from(await interaction.guild!.channels.fetch())
    .map(([, channel]) => channel)
    .filter((channel) => channel instanceof TextChannel)
    .filter((channel) => channel.name.includes(query))
    .filter((channel) => !registeredChannelIds.includes(channel.id));
}

async function getOptions(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";
  const textChannels = (await getTextChannels(interaction, input)).slice(0, 25);

  return interaction.respond(
    textChannels.map((channel) => ({
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
      autocomplete: getOptions,
    })
    channel: string,
    interaction: ChatInputCommandInteraction
  ) {
    if (!interaction.guildId) {
      return await interaction.reply("failed: guild not found");
    }

    const textChannels = await getTextChannels(interaction, "");
    if (textChannels.findIndex((c) => c.id === channel) === -1) {
      return await interaction.reply("failed: channel not found");
    }

    try {
      await addSendrerChannel(interaction.guildId, channel);
      await interaction.reply(`added sender channel <#${channel}>`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return await interaction.reply("failed: channel already exists");
        }
      } else {
        console.error(error);
        return await interaction.reply("failed: unknown error");
      }
    }
  }
}
