import { Interaction, TextChannel } from "discord.js";
import prisma from "..";

export async function getSenderChannelIds(serverId: string) {
  return (
    await prisma.sendChannel.findMany({
      where: { serverId },
    })
  ).map((channel) => channel.channelId);
}

export async function getSenderChannels(
  serverId: string,
  interaction: Interaction
) {
  if (!interaction.guild) return [];

  const allChannels = Array.from(await interaction.guild.channels.fetch())
    .map(([, channel]) => channel)
    .filter((channel) => channel instanceof TextChannel);

  const registeredChannelIds = await getSenderChannelIds(serverId);

  return allChannels.filter((channel) =>
    registeredChannelIds.some(
      (registeredChannelId) => registeredChannelId === channel.id
    )
  );
}

export async function addSendrerChannel(serverId: string, channelId: string) {
  return prisma.sendChannel.create({
    data: {
      channelId: channelId,
      server: {
        connectOrCreate: {
          where: { id: serverId },
          create: { id: serverId },
        },
      },
    },
  });
}

export async function deleteSenderChannel(serverId: string, channelId: string) {
  return prisma.sendChannel.deleteMany({
    where: {
      serverId,
      channelId,
    },
  });
}
