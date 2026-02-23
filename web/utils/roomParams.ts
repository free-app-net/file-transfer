export type RoomParams = {
  peerId: string;
  myId: string;
  secret: string;
};

export function parseRoomParams(str: string) {
  // remove the hash if present
  const hashIndex = str.indexOf("#");
  if (hashIndex !== -1) {
    str = str.substring(hashIndex + 1);
  }

  const myIdMatch = str.match(/m:([^;]+)/);
  const peerIdMatch = str.match(/p:([^;]+)/);
  const secretMatch = str.match(/s:([^;]+)/);

  if (
    !myIdMatch ||
    !myIdMatch[1] ||
    !peerIdMatch ||
    !peerIdMatch[1] ||
    !secretMatch ||
    !secretMatch[1]
  ) {
    return null;
  }

  return {
    myId: myIdMatch[1],
    peerId: peerIdMatch[1],
    secret: secretMatch[1],
  };
}

export function stringifyRoomParams(value: RoomParams) {
  return `m:${value.myId};p:${value.peerId};s:${value.secret}`;
}
