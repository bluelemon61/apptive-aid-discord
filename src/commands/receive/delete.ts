import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "@/utilities/prisma";

/**
 * Returns the all of this server's receiver channel list
 * 
 * @param interaction 
 * @param query - Channel name to find. Default is ""
 * @returns Array of receiver channels
 */
async function getReceiveChannels(interaction: Interaction, query: string = "") {
  if (!interaction.guild) return [];

  const allChannels = Array.from(await interaction.guild.channels.fetch())
    .map(([, channel]) => channel)
    .filter((channel) => channel instanceof TextChannel);

  const registeredChannelIds = (
    await prisma.receiveChannel.findMany({
      where: { serverId: interaction.guildId! },
    })
  ).map((channel) => channel.id);

  return allChannels
    .filter((channel) =>
      registeredChannelIds.some(
        (registeredChannelId) => registeredChannelId === channel.id
      )
    )
    .filter((channel) => channel.name.includes(query));
}

/**
 * Returns the all receiver channel list by option form
 * 
 * @param interaction 
 * @returns Array of receiver channels by option form
 */
async function getOptions(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";

  return interaction.respond(
    (await getReceiveChannels(interaction, input))
      .map((channel) => ({
        name: `# ${channel.name}`,
        value: channel.id,
      }))
      .slice(0, 25)
  );
}

@Discord()
@SlashGroup("receiver")
export class Receiver {
  @Slash({ name: "delete", description: "delete a receiver channel" })
  async delete(
    @SlashOption({
      name: "channel",
      description: "the channel to delete as a receiver",
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

    const channels = await getReceiveChannels(interaction, "");
    if (channels.findIndex((c) => c.id === channel) === -1) {
      return await interaction.reply("failed: channel not found");
    }

    try {
      await prisma.receiveChannel.delete({
        where: {
          id: channel,
          serverId: interaction.guildId!,
        },
      });
      await interaction.reply(`deleted receiver channel <#${channel}>`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return await interaction.reply("failed: channel not found");
        }
      } else {
        console.error(error);
        return await interaction.reply("failed: unknown error");
      }
    }
  }
}
