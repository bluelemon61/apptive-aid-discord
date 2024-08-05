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
 * @returns Array of sender channels
 */
async function getSenderChannels(interaction: Interaction, query: string = "") {
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

/**
 * Returns the all sender channel list by option form
 * 
 * @param interaction 
 * @returns Array of sender channels by option form
 */
async function getSenderOptions(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";
  const textChannels = (await getSenderChannels(interaction, input)).slice(0, 25);

  return interaction.respond(
    textChannels.map((channel) => ({
      name: `# ${channel.name}`,
      value: channel.id,
    }))
  );
}



/**
 * Returns the all of this server's channel list
 * 
 * @param interaction 
 * @param query - Channel name to find. Default is ""
 * @returns Array of channels
 */
async function getTextChannels(interaction: Interaction, query: string = "") {
  if (!interaction.guild) return [];

  return Array.from(await interaction.guild!.channels.fetch())
    .map(([, channel]) => channel)
    .filter((channel) => channel instanceof TextChannel)
    .filter((channel) => channel.name.includes(query));
}

/**
 * Returns the all channel list by option form
 * 
 * @param interaction 
 * @returns Array of channels by option form
 */
async function getTextChannelOptions(interaction: AutocompleteInteraction) {
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

@Discord()
@SlashGroup({
  name: "receiver",
  description: "listen, list, and delete receiver channels",
})
@SlashGroup("receiver")
export class Receiver {
  @Slash({ name: "listen", description: "Listen from sender channel" })
  async add(
    @SlashOption({
      name: "from",
      description: "The sender channel to listen",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getSenderOptions,
    })
    from: string,
    @SlashOption({
      name: "to",
      description: "The receiver channel | Default: this channel",
      required: false,
      type: ApplicationCommandOptionType.String,
      autocomplete: getTextChannelOptions,
    })
    to: string,
    interaction: ChatInputCommandInteraction
  ) {
    if (!interaction.guildId) {
      return await interaction.reply("failed: guild not found");
    }

    const senderChannels = await getSenderChannels(interaction, "");
    if (senderChannels.findIndex((c) => c.id === from) === -1) {
      return await interaction.reply("failed: sender channel not found");
    }

    const receiverId = to ? to : interaction.channelId;

    try {
      /** 
       * 아래와 같은 상황일 때 무한 반복 방지
       * 송신 -> 수신
       * A -> B, B -> C, C -> A
       */
      const isSender = await prisma.sendChannel.findUnique({
        where: {
          channelId: receiverId,
        },
      });

      if (isSender) {
        return await interaction.reply("failed: sender channel can't be receiver");
      }

      const existingChannel = await prisma.receiveChannel.findUnique({
        where: {
          channelId: receiverId,
        },
      });

      if (existingChannel) {
        await prisma.sendToReceive.create({
          data: {
            sendChannel: {
              connect: { channelId: from },
            },
            receiveChannel: {
              connect: { channelId: receiverId },
            },
          },
        });
      } else {
        await prisma.receiveChannel.create({
          data: {
            channelId: receiverId,
            server: {
              connectOrCreate: {
                where: { id: interaction.guildId },
                create: { id: interaction.guildId },
              },
            },
            sendChannels: {
              create: {
                sendChannel: {
                  connect: { channelId: from },
                },
              },
            },
          },
        });
      }
      await interaction.reply(`added receiver channel <#${from}> -> <#${receiverId}>`);
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
