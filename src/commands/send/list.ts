import prisma from "@/utilities/prisma";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";

@Discord()
@SlashGroup("sender")
export class Sender {
  @Slash({ name: "list", description: "list a sender channel" })
  async list(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    // 디스코드 서버에 등록된 모든 채널 조회
    const allChannels = Array.from(
      await interaction.guild!.channels.fetch()
    ).map(([, channel]) => channel);

    // DB에 등록된 채널 조회
    const registeredChannels = await prisma.sendChannel.findMany({
      where: { serverId: interaction.guildId },
      select: {
        channelId: true,
        receiveChannels: {
          select: {
            receiveChannelId: true,
          },
        },
      },
    });

    // 두 데이터를 합하여 필요한 데이터만 추출
    const channels = registeredChannels.reduce(
      (acc, sendChannel) => {
        const channel = allChannels.find(
          (c) => c?.id === sendChannel.channelId
        );

        if (channel instanceof TextChannel) {
          acc.push({
            id: channel.id,
            count: sendChannel.receiveChannels.length,
          });
        }

        return acc;
      },
      [] as { id: string; count: number }[]
    );

    // 빈 임베드를 보내지 않기 위함
    if (channels.length === 0) {
      await interaction.reply("No sender channels found in this server");
      return;
    }

    await interaction.reply({
      embeds: [
        {
          author: {
            name: interaction.guild!.name,
            icon_url: interaction.guild!.iconURL() || undefined,
          },
          title: "Sender Channels",
          fields: channels.map((channel) => ({
            name: "",
            value: `<#${channel.id}> ・ has ${channel.count} receive channels`,
          })),
        },
      ],
    });
  }
}
