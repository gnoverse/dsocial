import { createAppAsyncThunk } from "../utils/async-thunk";
import { ThunkExtra } from "redux/redux-provider";
import { findPreset, Network } from "@gno/constants/networks";
import { setActiveNetwork } from "@gno/utils/network-store";
import { fetchChainId } from "@gno/utils/tm2-rpc";

/**
 * Switch to another network, or to the same one after its chain changed.
 *
 * This signs out the user and drops the cached data, which belong to the previous chain: redux-provider
 * resets the slices on switchNetwork.fulfilled.
 */
export const switchNetwork = createAppAsyncThunk<void, Pick<Network, "id" | "rpc" | "chainId">, ThunkExtra>(
  "network/switch",
  async (network, thunkAPI) => {
    const { gnonative, userCache } = thunkAPI.extra;

    await gnonative.setRemote(network.rpc);
    await gnonative.setChainID(network.chainId);
    setActiveNetwork(network);

    // The user cache is not in redux.
    userCache.invalidateCache();
  }
);

/** Switch to a preset, reading its chain ID from the node if it doesn't have a fixed one. */
export const switchToPreset = createAppAsyncThunk<void, string, ThunkExtra>("network/switchToPreset", async (id, thunkAPI) => {
  const preset = findPreset(id);
  if (!preset) throw new Error(`Unknown network ${id}`);

  const chainId = preset.chainId ?? (await fetchChainId(preset.rpc));
  await thunkAPI.dispatch(switchNetwork({ id, rpc: preset.rpc, chainId })).unwrap();
});
