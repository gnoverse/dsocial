import { Platform } from "react-native";

/**
 * A network is one unit: an RPC endpoint, the chain ID it serves and the dSocial indexer which
 * follows it. Pairing an endpoint with another chain's ID would make the wallet sign for one chain
 * while we broadcast to a second one.
 */
export type Network = {
  /** Stable key, and what gets persisted. */
  id: string;
  label: string;
  /** May be scheme-less (`host:port`), in which case http:// is assumed. */
  rpc: string;
  chainId: string;
  /** The dSocial indexer (not a tx-indexer), or "" if there is none for this network. */
  indexer: string;
};

/** A preset without chainId serves a chain which changes over time. Its ID is read from the node. */
export type NetworkPreset = Omit<Network, "chainId"> & { chainId?: string };

// Loopback is relative to the device: the Android emulator reaches its host at 10.0.2.2.
const LOCAL_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";

export const BERTY_NETWORK: Network = {
  id: "berty",
  label: "Berty",
  rpc: "https://api.gno.berty.io",
  chainId: "dev",
  indexer: "https://indexer.gno.berty.io",
};

export const DEFAULT_NETWORK = BERTY_NETWORK;

export const NETWORK_PRESETS: readonly NetworkPreset[] = [
  BERTY_NETWORK,
  { id: "latest-testnet", label: "Latest testnet", rpc: "https://rpc.latest.testnets.gno.land", indexer: "" },
  { id: "local", label: "Local gnodev", rpc: `${LOCAL_HOST}:26657`, chainId: "dev", indexer: "" },
];

/** Marks the user-entered network, which is restored verbatim instead of from a preset. */
export const CUSTOM_NETWORK_ID = "custom";

export const findPreset = (id: string) => NETWORK_PRESETS.find((preset) => preset.id === id);
