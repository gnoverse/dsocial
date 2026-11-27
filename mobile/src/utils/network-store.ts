import { useSyncExternalStore } from "react";
import { CUSTOM_NETWORK_ID, DEFAULT_NETWORK, findPreset, Network } from "@gno/constants/networks";
import { jsonStore } from "./json-store";

/**
 * The network which dSocial talks to. The GnoConnect wallet doesn't choose it: we name our rpc and
 * chain ID in every launch link. It lives outside of redux because it configures gnonative and the
 * indexer, which are set up before the redux store.
 */
type Stored = {
  activeId?: string;
  custom?: { rpc: string; chainId: string };
  /** Chain IDs read from the nodes of the presets which don't have a fixed one. */
  chainIds?: Record<string, string>;
  /** The indexers entered by the user, by network ID. They override the preset's. */
  indexers?: Record<string, string>;
};

const store = jsonStore<Stored>("dsocial-network.json");

let stored: Stored | undefined;
let active: Network | undefined;
const listeners = new Set<() => void>();

const getStored = (): Stored => (stored ??= store.read());

const save = (changes: Stored) => {
  stored = { ...getStored(), ...changes };
  active = undefined;
  store.write(stored);
  listeners.forEach((listener) => listener());
};

/** Get the stored network, or undefined if its chain ID isn't known (yet). */
export const getNetwork = (id: string): Network | undefined => {
  const { custom, chainIds, indexers } = getStored();

  if (id === CUSTOM_NETWORK_ID) {
    if (!custom?.rpc || !custom.chainId) return undefined;
    return { id, label: "Custom", rpc: custom.rpc, chainId: custom.chainId, indexer: indexers?.[id] ?? "" };
  }

  const preset = findPreset(id);
  const chainId = preset?.chainId ?? chainIds?.[id];
  if (!preset || !chainId) return undefined;
  return { ...preset, chainId, indexer: indexers?.[id] || preset.indexer };
};

export const getActiveNetwork = (): Network => {
  const { activeId, indexers } = getStored();
  active ??= (activeId ? getNetwork(activeId) : undefined) ?? {
    ...DEFAULT_NETWORK,
    indexer: indexers?.[DEFAULT_NETWORK.id] || DEFAULT_NETWORK.indexer,
  };
  return active;
};

export const setActiveNetwork = ({ id, rpc, chainId }: Pick<Network, "id" | "rpc" | "chainId">) => {
  if (id === CUSTOM_NETWORK_ID) {
    save({ activeId: id, custom: { rpc, chainId } });
  } else if (findPreset(id)?.chainId) {
    save({ activeId: id });
  } else {
    save({ activeId: id, chainIds: { ...getStored().chainIds, [id]: chainId } });
  }
};

/** Return the user's indexer for the network, or the preset's, or "". */
export const getIndexer = (id: string): string => getStored().indexers?.[id] || findPreset(id)?.indexer || "";

/** Set the indexer for the network. An empty string restores the preset's. */
export const setIndexer = (id: string, indexer: string) => {
  save({ indexers: { ...getStored().indexers, [id]: indexer } });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useActiveNetwork = (): Network => useSyncExternalStore(subscribe, getActiveNetwork);
