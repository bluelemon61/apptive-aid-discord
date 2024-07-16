import { SlashCommand } from "../types/slashCommand";

export const ping: SlashCommand = {
  name: "ping",
  description: "ping에 pong으로 응답합니다.",
  execute: async (_, interaction) => {
    await interaction.followUp({
      ephemeral: true,
      content: 'Pong!',
    });
  }
}