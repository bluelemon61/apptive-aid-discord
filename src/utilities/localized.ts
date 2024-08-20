import { Locales } from "@/locales/i18n-types";
import { baseLocale, loadedLocales } from '@/locales/i18n-util';
import { Interaction } from "discord.js";

export function getPreferredLocale(interaction: Interaction) {
  if (Object.keys(loadedLocales).includes(interaction.locale)) {
    return interaction.locale as unknown as Locales;
  }

  if (
    interaction.inGuild() &&
    Object.keys(loadedLocales).includes(interaction.guildLocale)
  ) {
    return interaction.guildLocale as unknown as Locales;
  }

  return baseLocale as Locales;
}