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
 * Returns the all of this server's receive channel list
 *
 * @param interaction
 * @param query - Channel name to find. Default is ""
 * @returns Array of channels˃
 */
async function getReceiveChannels(
  interaction: Interaction,
  query: string = ""
) {
  if (!interaction.guild) return [];

  const registeredChannels = await prisma.receiveChannel.findMany({
    where: {
      serverId: interaction.guildId!,
    },
    select: {
      id: true,
    },
  });

  return (
    await Promise.all(
      registeredChannels.map(async (channel) => {
        return await interaction.guild?.channels.fetch(channel.id);
      })
    )
  )
    .filter((channel) => channel !== null)
    .filter((channel) => channel instanceof TextChannel)
    .filter((channel) => channel.name.includes(query));
}

/**
 * Returns the receive channel list by option form
 *
 * @param interaction
 * @returns Array of channels by option form
 */
async function getReceiveChannelOptions(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const input = interaction.options.getString("channel") || "";
  const textChannels = (await getReceiveChannels(interaction, input)).slice(
    0,
    25
  );

  return interaction.respond(
    textChannels.map((channel) => ({
      name: `# ${channel.name}`,
      value: channel.id,
    }))
  );
}

/**
 * Returns the sender channel listened by former channel
 *
 * @param interaction
 * @param query - Channel name to find. Default is ""
 * @returns Array of sender channels
 */
async function getSenderChannels(
  interaction: Interaction,
  query: string = "",
  receiver: string
) {
  if (!interaction.guild) return [];

  // DB에 등록된 채널 조회
  const registeredChannels = await prisma.sendChannel.findMany({
    where: {
      receiveChannels: {
        some: {
          receiveChannel: {
            id: receiver,
          },
        },
      },
    },
  });

  return (
    await Promise.all(
      registeredChannels.map(async (channel) => {
        return await interaction.client.channels.fetch(channel.id);
      })
    )
  )
    .filter((channel) => channel !== null)
    .filter((channel) => channel instanceof TextChannel)
    .filter((channel) => channel.name.includes(query));
}

/**
 * Returns the all sender channel list by option form
 *
 * @param interaction
 * @returns Array of sender channels by option form
 */
async function getSenderOptions(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;

  const receiver = interaction.options.getString("receiver") || "";

  const input = interaction.options.getString("channel") || "";
  const textChannels = (
    await getSenderChannels(interaction, input, receiver)
  ).slice(0, 25);

  return interaction.respond(
    textChannels.map((channel) => ({
      name: `${channel.guild.name} > # ${channel.name}`,
      value: channel.id,
    }))
  );
}

@Discord()
@SlashGroup("receiver")
export class Receiver {
  @Slash({
    name: "unlisten",
    description: "delete a sender channel from a receive channel",
  })
  async unlisten(
    @SlashOption({
      name: "receiver",
      description: "the receive channel to modify",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getReceiveChannelOptions,
    })
    to: string,
    @SlashOption({
      name: "sender",
      description: "the sender channel to delete from the receiver",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getSenderOptions,
    })
    from: string,
    interaction: ChatInputCommandInteraction
  ) {
    if (!interaction.guildId) {
      return await interaction.reply("failed: guild not found");
    }

    const receiveChannels = await getReceiveChannels(interaction, "");
    if (receiveChannels.findIndex((c) => c.id === to) === -1) {
      return await interaction.reply("failed: receive channel not found");
    }

    const senderChannels = await getSenderChannels(interaction, "", to);
    if (senderChannels.findIndex((c) => c.id === from) === -1) {
      return await interaction.reply("failed: send channel not found");
    }

    try {
      // sendChannel과의 관계 삭제
      await prisma.sendToReceive.deleteMany({
        where: {
          sendChannelId: from,
          receiveChannelId: to,
        },
      });

      const fromChannel = (await interaction.client.channels.fetch(
        from
      )) as TextChannel;

      await interaction.reply(
        `deleted sender channel \`${fromChannel.guild.name} > ${fromChannel.name}\` from receiver channel <#${to}>`
      );
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
