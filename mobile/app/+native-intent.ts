import { isWalletCallback } from "@gno/utils/gnoconnect";

/**
 * Keep the wallet's callbacks from the router. LinkingProvider handles them.
 *
 * When returning from the wallet, stay on the screen (and keep its form) which made the request. If the
 * OS had killed the app then that screen is gone, so open the root.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string | null {
  if (!isWalletCallback(path)) return path;
  return initial ? "/" : null;
}
