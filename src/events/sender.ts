import prisma from "@/utilities/prisma";
import { TextChannel } from "discord.js";
import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

@Discord()
export class Sender {
  @On()
  async messageCreate([message]: ArgsOf<"messageCreate">, client: Client) {
    if (!message.guild) return;

    const sendChannel = await prisma.sendChannel.findMany({
      where: { channelId: message.channel.id, serverId: message.guild!.id },
      select: {
        receiveChannels: {
          select: {
            receiveChannel: {
              select: {
                channelId: true,
                serverId: true,
              },
            },
          },
        },
      },
    });

    if (sendChannel.length === 0) return;

    console.log(
      `[Sender]: ${message.guild.name}(${message.guildId}) 서버의 ${message.channelId} 채널의 메시지를 송신합니다.`
    );

    const receiveChannels = sendChannel[0].receiveChannels.map(
      (channel) => channel.receiveChannel
    );
    
    receiveChannels.forEach(async (receiveChannel) => {
      try {
        const channel = await client.channels.fetch(receiveChannel.channelId);

        if (channel == null) {
          // 채널이 없으면 삭제 (채널 삭제 시 봇이 삭제 이벤트에 일일이 대응하기 힘듬)
          await prisma.receiveChannel.deleteMany({
            where: {
              channelId: receiveChannel.channelId,
              serverId: receiveChannel.serverId,
            },
          });
        } else if (channel instanceof TextChannel) {
          /* const result = */ await channel.send({
            content: `${message.content}\n\nfrom \`${message.guild!.name}\``,
            files: message.attachments.map((attachment) => attachment.url),
            embeds: message.embeds,
            components: message.components,
          });
        }
      } catch(error) {
        console.error(error);
        console.info(`Error Info\nreceiver: ${receiveChannel}\nsender: ${message}`);
      }
      
    });
  }
}
