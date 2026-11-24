import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../utils/async-thunk";
import { makeCallTx } from "./linkingSlice";
import { User } from "@gno/types";
import { GnoNativeApi } from "@gnolang/gnonative";
import { RootState, ThunkExtra } from "redux/redux-provider";
import { getActiveNetwork } from "@gno/utils/network-store";

export interface CounterState {
  account?: User;
  loading: boolean;
}

const initialState: CounterState = {
  account: undefined,
  loading: false,
};

export const loggedIn = createAppAsyncThunk<User, void, ThunkExtra>("account/loggedIn", async (param, thunkAPI) => {
  console.log("Logging in", param);

  const { bech32AddressSelected: bech32, chainId } = (thunkAPI.getState() as RootState).linking;

  if (!bech32) {
    throw new Error("No bech32 address found for login");
  }

  // Our connect request names the chain. If the wallet answers for another one, don't sign in.
  const network = getActiveNetwork();
  if (chainId && chainId !== network.chainId) {
    throw new Error(`The wallet is on chain "${chainId}" but the network selected here is "${network.chainId}".`);
  }

  const gnonative = thunkAPI.extra.gnonative as GnoNativeApi;

  const user: User = {
    name: (await getAccountName(bech32, gnonative)) || "Unknown",
    address: await gnonative.addressFromBech32(bech32),
    bech32,
    avatar: await loadBech32AvatarFromChain(bech32, thunkAPI),
  };

  return user;
});

async function getAccountName(bech32: string, gnonative: GnoNativeApi) {
  try {
    console.log("GetUserByAddress request:", bech32);
    const accountNameStr = await gnonative.qEval("gno.land/r/sys/users", `ResolveAddress("${bech32}").Name()`);
    console.log("GetUserByAddress result:", accountNameStr);
    const accountName = accountNameStr.match(/\("(\w+)"/)?.[1];
    console.log("GetUserByAddress after regex", accountName);
    return accountName;
  } catch (error) {
    console.error("Error getting account name", error);
  }
  return undefined;
}

interface AvatarCallTxParams {
  dataUri: string;
  callerAddressBech32: string;
}

export const avatarTxAndRedirectToSign = createAppAsyncThunk<string, AvatarCallTxParams, ThunkExtra>(
  "account/avatarTxAndRedirectToSign",
  ({ dataUri, callerAddressBech32 }) =>
    makeCallTx({
      packagePath: "gno.land/r/demo/profile",
      fnc: "SetStringField",
      args: [
        ["field", "Avatar"],
        ["value", dataUri],
      ],
      callerAddressBech32,
    })
);

export const reloadAvatar = createAppAsyncThunk<string | undefined, void, ThunkExtra>(
  "account/reloadAvatar",
  async (param, thunkAPI) => {
    const state = (await thunkAPI.getState()) as CounterState;
    // @ts-ignore
    const bech32 = state.account?.account?.bech32;
    if (bech32) {
      return await loadBech32AvatarFromChain(bech32, thunkAPI);
    }
    return undefined;
  }
);

const loadBech32AvatarFromChain = async (bech32: string, thunkAPI: ThunkExtra) => {
  const gnonative = thunkAPI.extra.gnonative as GnoNativeApi;
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/tmp";

  try {
    console.log("Loading avatar for", bech32);
    const response = await gnonative.qEval(
      "gno.land/r/demo/profile",
      `GetStringField("${bech32}","Avatar", "${DEFAULT_AVATAR}")`
    );
    return response.substring(2, response.length - '" string)'.length);
  } catch (error) {
    console.error("Error loading avatar", error);
  }
  return DEFAULT_AVATAR;
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    logedOut: (state) => {
      state.account = undefined;
    },
  },

  extraReducers(builder) {
    builder.addCase(loggedIn.pending, (state) => {
      state.loading = true;
      console.log("loggedIn.pending");
    });
    builder.addCase(loggedIn.fulfilled, (state, action) => {
      state.account = action.payload;
      state.loading = false;
      console.log("Logged in", action.payload);
    });
    builder.addCase(loggedIn.rejected, (state, action) => {
      state.loading = false;
      console.error("loggedIn.rejected", action);
    });
    builder.addCase(reloadAvatar.fulfilled, (state, action) => {
      if (state.account) {
        console.log("Reloading avatar", action.payload);
        state.account.avatar = action.payload;
      } else {
        console.error("No account to set avatar");
      }
    });
  },

  selectors: {
    selectAccount: (state) => state.account,
    selectAvatar: (state) => state.account?.avatar,
    selectLoginLoading: (state) => state.loading,
  },
});

export const { logedOut } = accountSlice.actions;

export const { selectAccount, selectAvatar, selectLoginLoading } = accountSlice.selectors;
