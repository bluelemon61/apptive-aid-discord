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
      id: true,
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

  const input = interaction.options.getString("channel") || "";
  const textChannels = (await getSenderChannels(interaction, input)).slice(
    0,
    25
  );

  return interaction.respond(
    textChannels.map((channel) => ({
      name: `${channel.guild.name} > # ${channel.name}`,
      value: channel.id,
    }))
  );
}

/**
 * Returns the all of this server's channel list
 *
 * @param interaction
 * @param query - Channel name to find. Default is ""
 * @returns Array of channels˃
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
  descriptionLocalizations: {
    ko: "수신 채널을 관리합니다.",
  },
})
@SlashGroup("receiver")
export class Receiver {
  @Slash({
    name: "listen",
    description: "Listen from sender channel",
    descriptionLocalizations: {
      ko: "송신 채널로부터 메시지를 수신합니다",
    },
  })
  async add(
    @SlashOption({
      name: "from",
      description: "The sender channel to listen",
      nameLocalizations: {
        ko: "송신채널",
      },
      descriptionLocalizations: {
        ko: "메시지를 전송할 채널",
      },
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: getSenderOptions,
    })
    from: string,
    @SlashOption({
      name: "to",
      description: "The receiver channel | Default: this channel",
      nameLocalizations: {
        ko: "수신채널",
      },
      descriptionLocalizations: {
        ko: "메시지를 수신받을 채널",
      },
      required: false,
      type: ApplicationCommandOptionType.String,
      autocomplete: getTextChannelOptions,
    })
    to: string,
    interaction: ChatInputCommandInteraction
  ) {
    const LL = L[getPreferredLocale(interaction)];

    if (!interaction.guildId) {
      return await interaction.reply(LL.ERROR_GUILD_NOT_FOUND());
    }

    interaction.deferReply();

    const senderChannels = await getSenderChannels(interaction, "");
    if (senderChannels.findIndex((c) => c.id === from) === -1) {
      return await interaction.editReply(
        LL.RECEIVER_LISTEN_ERROR_SENDER_NOT_FOUND()
      );
    }

    const receiverId = to ? to : interaction.channelId;
    ``;

    try {
      /**
       * 아래와 같은 상황일 때 무한 반복 방지
       * 송신 -> 수신
       * A -> B, B -> C, C -> A
       */
      const isSender = await prisma.sendChannel.findUnique({
        where: {
          id: receiverId,
        },
      });

      if (isSender) {
        return await interaction.editReply(
          LL.RECEIVER_LISTEN_ERROR_SENDER_CONFLICT()
        );
      }

      await prisma.sendToReceive.create({
        data: {
          sendChannel: {
            connect: {
              id: from,
            },
          },
          receiveChannel: {
            connectOrCreate: {
              where: { id: receiverId },
              create: {
                id: receiverId,
                server: {
                  connectOrCreate: {
                    where: { id: interaction.guildId },
                    create: { id: interaction.guildId },
                  },
                },
              },
            },
          },
        },
      });

      const fromChannel = (await interaction.client.channels.fetch(
        from
      )) as TextChannel;

      await interaction.editReply(
        LL.RECEIVER_LISTEN_SUCCESS({
          from_channel: fromChannel.name,
          from_guild: fromChannel.guild.name,
          to: receiverId,
        })
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return await interaction.editReply(LL.RECEIVER_LISTEN_ERROR_ALREADY_EXISTS());
        }
      } else {
        console.error(error);
        return await interaction.editReply(LL.ERROR_UNKNOWN());
      }
    }
  }
}
