import type { BaseTranslation } from "../i18n-types.js";

const en = {
  ERROR_GUILD_NOT_FOUND: "error: guild not found",
  ERROR_CHANNEL_NOT_FOUND: "error: channel not found",
  ERROR_UNKNOWN: "error: unknown error",

  SENDER_ADD_ERROR_RECEIVER_CONFLICT: "error: receiver channel can't be sender",
  SENDER_ADD_ERROR_ALREADY_EXISTS: "error: channel already exists",
  SENDER_ADD_SUCCESS: "added sender channel <#{channel: string}>",

  SENDER_LIST_SUCCESS_EMPTY: "no sender channels found in this server",
  SENDER_LIST_SUCCESS_TITLE: "Sender Channels",
  SENDER_LIST_SUCCESS_ITEM:
    "<#{id: string}> ・ has {count: number} receive channels",

  SENDER_DELETE_SUCCESS: "deleted sender channel <#{channel: string}>",

  RECEIVER_LISTEN_ERROR_SENDER_NOT_FOUND: "error: sender channel not found",
  RECEIVER_LISTEN_ERROR_SENDER_CONFLICT:
    "error: receiver channel can't be sender",
  RECEIVER_LISTEN_ERROR_ALREADY_EXISTS:
    "error: receiver binding already exists",
  RECEIVER_LISTEN_SUCCESS:
    "set receiver channel `{from_guild: string} > {from_channel: string}` → <#{to: string}>",

  RECEIVER_UNLISTEN_ERROR_SENDER_NOT_FOUND: "error: sender channel not found",
  RECEIVER_UNLISTEN_ERROR_RECEIVER_NOT_FOUND:
    "error: receiver channel not found",
  RECEIVER_UNLISTEN_SUCCESS:
    "deleted sender channel `{from_guild: string} > {from_channel: string}` from receiver channel <#{to: string}>",

  RECEIVER_LIST_SUCCESS_EMPTY: "no receiver channels found in this server",
  RECEIVER_LIST_SUCCESS_TITLE: "Receiver Channels",
  RECEIVER_LIST_SUCCESS_ITEM:
    "<#{id: string}> ・ is listening to {count: number} sender channels",

  RECEIVER_DELETE_SUCCESS: "deleted receiver channel <#{channel: string}>",
} satisfies BaseTranslation;

export default en;
