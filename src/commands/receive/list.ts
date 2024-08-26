import L from "../../locales/i18n-node";
import { getPreferredLocale } from "../../utilities/localized";
import prisma from "../../utilities/prisma";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";

@Discord()
@SlashGroup("receiver")
export class Recevier {
  @Slash({
    name: "list",
    description: "list a receiver channel",
    descriptionLocalizations: {
      ko: "수신 채널의 목록을 확인합니다"
    }
  })
  async list(interaction: ChatInputCommandInteraction) {
    const LL = L[getPreferredLocale(interaction)];

    if (!interaction.guildId) {
      return await interaction.reply(LL.ERROR_GUILD_NOT_FOUND());
    }

    interaction.deferReply();

    // 디스코드 서버에 등록된 모든 수신 채널 조회
    const allChannels = Array.from(
      await interaction.guild!.channels.fetch()
    ).map(([, channel]) => channel);

    // DB에 등록된 채널 조회
    const registeredChannels = await prisma.receiveChannel.findMany({
      where: { serverId: interaction.guildId },
      select: {
        id: true,
        sendChannels: {
          select: {
            sendChannelId: true,
          },
        },
      },
    });

    // 두 데이터를 합하여 필요한 데이터만 추출
    const channels = registeredChannels.reduce(
      (acc, receiveChannel) => {
        const channel = allChannels.find(
          (c) => c?.id === receiveChannel.id
        );

        if (channel instanceof TextChannel) {
          acc.push({
            id: channel.id,
            count: receiveChannel.sendChannels.length,
          });
        }

        return acc;
      },
      [] as { id: string; count: number }[]
    );

    // 빈 임베드를 보내지 않기 위함
    if (channels.length === 0) {
      await interaction.editReply(LL.RECEIVER_LIST_SUCCESS_EMPTY());
      return;
    }

    await interaction.editReply({
      embeds: [
        {
          author: {
            name: interaction.guild!.name,
            icon_url: interaction.guild!.iconURL() || undefined,
          },
          title: LL.RECEIVER_LIST_SUCCESS_TITLE(),
          fields: channels.map((channel) => ({
            name: "",
            value: LL.RECEIVER_LIST_SUCCESS_ITEM({
              id: channel.id,
              count: channel.count,
            }),
          })),
        },
      ],
    });
  }
}
