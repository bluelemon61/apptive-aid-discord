import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../../utilities/prisma";
import L from "../../locales/i18n-node";
import { getPreferredLocale } from "../../utilities/localized";

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
  @Slash({ 
    name: "delete",
    description: "delete a receiver channel",
    descriptionLocalizations: {
      ko: "수신 채널을 삭제합니다"
    }
  })
  async delete(
    @SlashOption({
      name: "channel",
      description: "the channel to delete as a receiver",
      nameLocalizations: {
        ko: "채널"
      },
      descriptionLocalizations: {
        ko: "삭제할 수신 채널"
      },
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getOptions,
    })
    channel: string,
    interaction: ChatInputCommandInteraction
  ) {
    const LL = L[getPreferredLocale(interaction)];

    if (!interaction.guildId) {
      return await interaction.reply(LL.ERROR_GUILD_NOT_FOUND());
    }

    await interaction.deferReply();

    const channels = await getReceiveChannels(interaction, "");
    if (channels.findIndex((c) => c.id === channel) === -1) {
      return await interaction.editReply(LL.ERROR_CHANNEL_NOT_FOUND());
    }

    try {
      await prisma.receiveChannel.delete({
        where: {
          id: channel,
          serverId: interaction.guildId!,
        },
      });
      await interaction.reply(LL.RECEIVER_DELETE_SUCCESS({channel}));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return await interaction.editReply(LL.ERROR_CHANNEL_NOT_FOUND());
        }
      } else {
        console.error(error);
        return await interaction.editReply(LL.ERROR_UNKNOWN());
      }
    }
  }
}
