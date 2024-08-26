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
    descriptionLocalizations: {
      ko: "수신 채널에서 특정 송신 채널을 삭제합니다",
    },
  })
  async unlisten(
    @SlashOption({
      name: "receiver",
      description: "the receive channel to modify",
      nameLocalizations: {
        ko: "수신채널",
      },
      descriptionLocalizations: {
        ko: "변경할 수신 채널",
      },
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getReceiveChannelOptions,
    })
    to: string,
    @SlashOption({
      name: "sender",
      description: "the sender channel to delete from the receiver",
      nameLocalizations: {
        ko: "송신채널",
      },
      descriptionLocalizations: {
        ko: "수신 채널에서 삭제할 송신 채널",
      },
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getSenderOptions,
    })
    from: string,
    interaction: ChatInputCommandInteraction
  ) {
    const LL = L[getPreferredLocale(interaction)];

    if (!interaction.guildId) {
      return await interaction.reply(LL.ERROR_GUILD_NOT_FOUND());
    }

    const receiveChannels = await getReceiveChannels(interaction, "");
    if (receiveChannels.findIndex((c) => c.id === to) === -1) {
      return await interaction.reply(LL.RECEIVER_UNLISTEN_ERROR_RECEIVER_NOT_FOUND());
    }

    const senderChannels = await getSenderChannels(interaction, "", to);
    if (senderChannels.findIndex((c) => c.id === from) === -1) {
      return await interaction.reply(LL.RECEIVER_UNLISTEN_ERROR_SENDER_NOT_FOUND());
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

      await interaction.reply(LL.RECEIVER_UNLISTEN_SUCCESS({
        from_guild: fromChannel.guild.name,
        from_channel: fromChannel.name,
        to
      }));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return await interaction.reply(LL.ERROR_CHANNEL_NOT_FOUND());
        }
      } else {
        console.error(error);
        return await interaction.reply(LL.ERROR_UNKNOWN());
      }
    }
  }
}
