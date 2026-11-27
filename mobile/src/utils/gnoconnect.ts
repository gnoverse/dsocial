/**
 * GnoConnect launch links and callbacks. See
 * https://github.com/gnolang/gno/blob/master/docs/resources/gnoconnect.md
 */
const WALLET_SCHEME = "land.gno.gnokey";

/** Where the wallet answers. It isn't a route: app/+native-intent.ts keeps it from the router. */
export const CALLBACK_URL = "tech.berty.dsocial://gnoconnect";

export type LaunchHost = "connect" | "signtx";

/**
 * Make a launch link. Not with URLSearchParams, which encodes a space as "+": the standard wants
 * percent-encoding, and reads "+" literally in some of the parameters.
 */
export const makeLaunchLink = (host: LaunchHost, params: [name: string, value: string][]): string => {
  const query = params.map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`).join("&");
  return `${WALLET_SCHEME}://${host}?${query}`;
};

export const isWalletCallback = (url: string): boolean =>
  url === CALLBACK_URL || url.startsWith(`${CALLBACK_URL}?`) || url.startsWith(`${CALLBACK_URL}/`);

/** Parse the callback's parameters. If a name is repeated, the last one is authoritative. */
export const parseCallback = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const query = url.split("#")[0].split("?").slice(1).join("?");
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const separator = pair.indexOf("=");
    const name = separator < 0 ? pair : pair.slice(0, separator);
    const value = separator < 0 ? "" : pair.slice(separator + 1);
    try {
      params[decodeURIComponent(name)] = decodeURIComponent(value);
    } catch {
      // Not percent-encoding. Ignore it: the callback can come from any app.
    }
  }
  return params;
};
