import { randomBytes } from "crypto";

export function generateCode(): string {
  return randomBytes(32).toString("hex");
}

export function generateSecret(): string {
  return randomBytes(48).toString("base64url");
}
