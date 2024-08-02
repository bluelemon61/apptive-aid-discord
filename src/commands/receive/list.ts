import prisma from "@/utilities/prisma";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";

@Discord()
@SlashGroup("receiver")
export class Recevier {
  @Slash({ name: "list", description: "list a receiver channel" })
  async list(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    // 디스코드 서버에 등록된 모든 채널 조회
    const allChannels = Array.from(
      await interaction.guild!.channels.fetch()
    ).map(([, channel]) => channel);

    // DB에 등록된 채널 조회
    const registeredChannels = await prisma.receiveChannel.findMany({
      where: { serverId: interaction.guildId },
      select: {
        channelId: true,
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
          (c) => c?.id === receiveChannel.channelId
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
      await interaction.reply("No receiver channels found in this server");
      return;
    }

    await interaction.reply({
      embeds: [
        {
          author: {
            name: interaction.guild!.name,
            icon_url: interaction.guild!.iconURL() || undefined,
          },
          title: "Receiver Channels",
          fields: channels.map((channel) => ({
            name: "",
            value: `<#${channel.id}> ・ is listening to ${channel.count} sender channels`,
          })),
        },
      ],
    });
  }
}
