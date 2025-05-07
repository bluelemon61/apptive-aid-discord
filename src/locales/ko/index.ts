import type { Translation } from "../i18n-types";

const ko = {
  ERROR_GUILD_NOT_FOUND: "오류: 서버를 찾을 수 없습니다.",
  ERROR_CHANNEL_NOT_FOUND: "오류: 채널을 찾을 수 없습니다.",
  ERROR_UNKNOWN: "오류: 알 수 없는 오류가 발생했습니다.",

  SENDER_ADD_ERROR_RECEIVER_CONFLICT:
    "오류: 수신 채널은 송신 채널로 등록할 수 없습니다.",
  SENDER_ADD_ERROR_ALREADY_EXISTS: "오류: 채널이 이미 존재합니다.",
  SENDER_ADD_SUCCESS: "<#{channel}>을 송신 채널로 등록했습니다.",

  SENDER_LIST_SUCCESS_EMPTY: "서버에 등록된 송신 채널이 없습니다.",
  SENDER_LIST_SUCCESS_TITLE: "송신 채널 목록",
  SENDER_LIST_SUCCESS_ITEM: "<#{id}> ・ {count}개의 채널에서 수신 중",

  SENDER_DELETE_SUCCESS: "<#{channel}>을 송신 채널에서 삭제했습니다.",

  RECEIVER_LISTEN_ERROR_SENDER_NOT_FOUND: "오류: 송신 채널을 찾을 수 없습니다.",
  RECEIVER_LISTEN_ERROR_SENDER_CONFLICT:
    "오류: 송신 채널은 수신 채널로 등록할 수 없습니다.",
  RECEIVER_LISTEN_ERROR_ALREADY_EXISTS: "오류: 수신 설정이 이미 존재합니다.",
  RECEIVER_LISTEN_SUCCESS:
    "수신 설정을 완료했습니다. `{from_guild} > {from_channel}` → <#{to}>",

  RECEIVER_UNLISTEN_ERROR_SENDER_NOT_FOUND:
    "오류: 송신 채널을 찾을 수 없습니다.",
  RECEIVER_UNLISTEN_ERROR_RECEIVER_NOT_FOUND:
    "오류: 수신 채널을 찾을 수 없습니다.",
  RECEIVER_UNLISTEN_SUCCESS:
    "<#{to}>에서 송신 채널 `{from_guild} > {from_channel}`을 삭제했습니다.",

  RECEIVER_LIST_SUCCESS_EMPTY: "서버에 등록된 수신 채널이 없습니다.",
  RECEIVER_LIST_SUCCESS_TITLE: "수신 채널 목록",
  RECEIVER_LIST_SUCCESS_ITEM: "<#{id}> ・ {count}개의 송신 채널 등록됨",

  RECEIVER_DELETE_SUCCESS: "<#{channel}>을 수신 채널에서 삭제했습니다.",
} satisfies Translation;

export default ko;
