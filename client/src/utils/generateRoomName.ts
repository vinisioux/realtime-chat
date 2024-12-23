import { customAlphabet } from "nanoid";

export function generateRoomName() {
  const nanoid = customAlphabet("1234567890abcdefghij", 12);

  return `@${nanoid()}`;
}
