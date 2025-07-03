import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeCallTx } from "./linkingSlice";
import { User } from "@gno/types";
import { GnoNativeApi } from "@gnolang/gnonative";
import { RootState, ThunkExtra } from "redux/redux-provider";

export interface CounterState {
  account?: User;
  loading: boolean;
}

const initialState: CounterState = {
  account: undefined,
  loading: false,
};

interface LoginParam {
  bech32: string;
}

export const loggedIn = createAsyncThunk<User, LoginParam, ThunkExtra>("account/loggedIn", async (param, thunkAPI) => {
  console.log("Logging in", param);
  const { bech32 } = param;

  const gnonative = thunkAPI.extra.gnonative as GnoNativeApi;

  const user: User = {
    name: await getAccountName(bech32, gnonative) || 'Unknown',
    address: await gnonative.addressFromBech32(bech32),
    bech32,
    avatar: await loadBech32AvatarFromChain(bech32, thunkAPI)
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
    return accountName
  } catch (error) {
      console.error("Error getting account name", error);
  }
  return undefined;
}

interface AvatarCallTxParams {
  mimeType: string;
  base64: string;
  callerAddressBech32: string;
  callbackPath: string;
}

export const avatarTxAndRedirectToSign = createAsyncThunk<void, AvatarCallTxParams, ThunkExtra>("account/avatarTxAndRedirectToSign", async (props, thunkAPI) => {
  const { mimeType, base64, callerAddressBech32, callbackPath } = props;

  const gnonative = thunkAPI.extra.gnonative;

  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);
  const args: Array<string> = ["Avatar", String(`data:${mimeType};base64,` + base64)];
  const reason = "Upload a new avatar";
  // const session = (thunkAPI.getState() as RootState).linking.session;

  await makeCallTx({ packagePath: "gno.land/r/demo/profile", fnc: "SetStringField", args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath }, gnonative);
});

export const reloadAvatar = createAsyncThunk<string | undefined, void, ThunkExtra>("account/reloadAvatar", async (param, thunkAPI) => {

  const state = await thunkAPI.getState() as CounterState;
  // @ts-ignore
  const bech32 = state.account?.account?.bech32;
  if (bech32) {
    return await loadBech32AvatarFromChain(bech32, thunkAPI);
  }
  return undefined;
});

const loadBech32AvatarFromChain = async (bech32: string, thunkAPI: ThunkExtra) => {
  const gnonative = thunkAPI.extra.gnonative as GnoNativeApi;
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/tmp"

  try {
    console.log("Loading avatar for", bech32);
    const response = await gnonative.qEval("gno.land/r/demo/profile", `GetStringField("${bech32}","Avatar", "${DEFAULT_AVATAR}")`);
    return response.substring(2, response.length - "\" string)".length);
  } catch (error) {
    console.error("Error loading avatar", error);
  }
  return DEFAULT_AVATAR;
}

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
