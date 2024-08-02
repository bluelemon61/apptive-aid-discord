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
 * Returns the all sender channel list
 * 
 * @param interaction 
 * @param query - Channel name to find. Default is ""
 * @returns Array of channels
 */
async function getTextChannels(interaction: Interaction, query: string = "") {
  if (!interaction.guild) return [];

  // DB에 등록된 채널 조회
  const registeredChannels = await prisma.sendChannel.findMany({
    select: {
      channelId: true,
    },
  });

  return (await Promise.all(
    registeredChannels.map(async (channel) => {
      return await interaction.client.channels.fetch(channel.channelId);
    })
  ))
    .filter((channel) => channel !== null)
    .filter((channel) => channel instanceof TextChannel)
    .filter((channel) => channel.name.includes(query))
}

async function getOptions(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";
  const textChannels = (await getTextChannels(interaction, input)).slice(0, 25);

  return interaction.respond(
    textChannels.map((channel) => ({
      name: `# ${channel.name}`,
      value: channel.id,
    }))
  );
}

// TODO - receiver listen {channel} {to}로 변경
@Discord()
@SlashGroup({
  name: "receiver",
  description: "listen, list, and delete receiver channels",
})
@SlashGroup("receiver")
export class Receiver {
  @Slash({ name: "listen", description: "listen from sender channel" })
  async add(
    @SlashOption({
      name: "channel",
      description: "the sender channel to listen at this receiver channel",
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
      await prisma.receiveChannel.create({
        data: {
          channelId: interaction.channelId,
          server: {
            connectOrCreate: {
              where: { id: interaction.guildId },
              create: { id: interaction.guildId },
            },
          },
          sendChannels: {
            create: {
              sendChannel: {
                connect: { 
                  channelId: channel
                }
              },
            }
          }
        },
      });
      await interaction.reply(`added receiver channel <#${channel}>`);
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
