import { sample } from "lodash";

export function slugGenerator() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const length = 7;

  let result = "";
  for (let i = 0; i < length; i++) {
    result += sample(chars.split(""));
  }

  return result;
}
