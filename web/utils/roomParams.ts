import { nanoid } from "nanoid";

const ID_LENGTH = 20;

export type RoomParams = {
  roomId: string;
  secret: string;
};

export function parseRoomParams(str: string): RoomParams | null {
  // remove the hash if present
  const hashIndex = str.indexOf("#");
  if (hashIndex !== -1) {
    str = str.substring(hashIndex + 1);
  }

  const parts = str.split(";");
  if (
    parts.length !== 2 ||
    parts[0]!.length !== ID_LENGTH ||
    parts[1]!.length !== ID_LENGTH
  ) {
    return null;
  }

  return {
    roomId: parts[0]!,
    secret: parts[1]!,
  };
}

export function generateRoomParams(): RoomParams {
  const roomId = nanoid(ID_LENGTH);
  const secret = nanoid(ID_LENGTH);

  return {
    roomId,
    secret,
  };
}

export function stringifyRoomParams(value: RoomParams) {
  return `${value.roomId};${value.secret}`;
}
