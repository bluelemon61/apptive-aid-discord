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

async function getSendChannels(interaction: Interaction, query: string = "") {
  if (!interaction.guild) return [];

  const allChannels = Array.from(await interaction.guild.channels.fetch())
    .map(([, channel]) => channel)
    .filter((channel) => channel instanceof TextChannel);

  const registeredChannelIds = (
    await prisma.sendChannel.findMany({
      where: { serverId: interaction.guildId! },
    })
  ).map((channel) => channel.channelId);

  return allChannels
    .filter((channel) =>
      registeredChannelIds.some(
        (registeredChannelId) => registeredChannelId === channel.id
      )
    )
    .filter((channel) => channel.name.includes(query));
}

async function getOptions(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";

  return interaction.respond(
    (await getSendChannels(interaction, input))
      .map((channel) => ({
        name: `# ${channel.name}`,
        value: channel.id,
      }))
      .slice(0, 25)
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
      autocomplete: getOptions,
    })
    channel: string,
    interaction: ChatInputCommandInteraction
  ) {
    if (!interaction.guildId) {
      return await interaction.reply("failed: guild not found");
    }

    const channels = await getSendChannels(interaction, "");
    if (channels.findIndex((c) => c.id === channel) === -1) {
      return await interaction.reply("failed: channel not found");
    }

    try {
      await prisma.sendChannel.deleteMany({
        where: {
          serverId: interaction.guildId!,
          channelId: channel,
        },
      });
      await interaction.reply(`deleted sender channel <#${channel}>`);
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
