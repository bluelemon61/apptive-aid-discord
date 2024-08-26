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
 * Returns the all of this server's channel list
 * 
 * @param interaction 
 * @param query - Channel name to find. Default is ""
 * @returns Array of channels
 */
async function getTextChannels(interaction: Interaction, query: string = "") {
  if (!interaction.guild) return [];

  const registeredChannelIds = (
    await prisma.sendChannel.findMany({
      where: { serverId: interaction.guildId! },
    })
  ).map((channel) => channel.id);

  return Array.from(await interaction.guild!.channels.fetch())
    .map(([, channel]) => channel)
    .filter((channel) => channel instanceof TextChannel)
    .filter((channel) => channel.name.includes(query))
    .filter((channel) => !registeredChannelIds.includes(channel.id));
}

/**
 * Returns the all channel list by option form
 * 
 * @param interaction 
 * @returns Array of channels by option form
 */
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

@Discord()
@SlashGroup({
  name: "sender",
  description: "add, list, and delete sender channels",
  descriptionLocalizations: {
    ko: "송신 채널을 관리합니다.",
  }
})
@SlashGroup("sender")
export class Sender {
  @Slash({ 
    name: "add",
    description: "add a sender channel",
    descriptionLocalizations: {
      ko: "송신 채널을 추가합니다",
    }
  })
  async add(
    @SlashOption({
      name: "channel",
      description: "the channel to add as a sender",
      nameLocalizations: {
        ko: "채널",
      },
      descriptionLocalizations: {
        ko: "송신 채널로 추가할 채널",
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

    const textChannels = await getTextChannels(interaction, "");
    if (textChannels.findIndex((c) => c.id === channel) === -1) {
      return await interaction.reply(LL.ERROR_CHANNEL_NOT_FOUND());
    }

    try {
      /** 
       * 아래와 같은 상황일 때 무한 반복 방지
       * 송신 -> 수신
       * A -> B, B -> C, C -> A
       */
      const isReceiver = await prisma.receiveChannel.findUnique({
        where: {
          id: channel,
        },
      });

      if (isReceiver) {
        return await interaction.reply(LL.SENDER_ADD_ERROR_RECEIVER_CONFLICT());
      }

      await prisma.sendChannel.create({
        data: {
          id: channel,
          server: {
            connectOrCreate: {
              where: { id: interaction.guildId },
              create: { id: interaction.guildId },
            },
          },
        },
      });
      await interaction.reply(LL.SENDER_ADD_SUCCESS({channel}));
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return await interaction.reply(LL.SENDER_ADD_ERROR_ALREADY_EXISTS());
        }
      } else {
        console.error(error);
        return await interaction.reply(LL.ERROR_UNKNOWN());
      }
    }
  }
}
