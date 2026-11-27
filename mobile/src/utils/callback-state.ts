import "react-native-get-random-values";
import { jsonStore } from "./json-store";

/**
 * Single-use `state` tokens, issued with each GnoConnect launch link and expected back on the callback.
 *
 * The callback scheme is public: any installed app can open it. So a callback is trusted only if it
 * echoes a token we issued. Otherwise a forged one could set the signed-in address or have us
 * broadcast its transaction.
 *
 * The tokens are persisted since the OS may kill dSocial while the user is in the wallet. Kept in
 * memory, the token would be lost and the wallet's legitimate answer rejected.
 */
const store = jsonStore<Record<string, number>>("gnoconnect-callback-states.json");

const TTL_MS = 15 * 60 * 1000;

const readValid = (): Record<string, number> => {
  const oldest = Date.now() - TTL_MS;
  const entries = Object.entries(store.read()) as [string, number][];
  return Object.fromEntries(entries.filter(([, issuedAt]) => issuedAt >= oldest));
};

/** Issue a token to send as `state`, and remember it for the callback. */
export const issueState = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  store.write({ ...readValid(), [token]: Date.now() });
  return token;
};

/** Return true if we issued this token and it hasn't expired. It can't be used again. */
export const consumeState = (token: string): boolean => {
  const { [token]: issuedAt, ...others } = readValid();
  store.write(others);
  return issuedAt !== undefined;
};
