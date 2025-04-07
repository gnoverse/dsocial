import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeCallTx } from "./linkingSlice";
import { Following } from "@gno/types";
import { RootState, ThunkExtra } from "redux/redux-provider";

const CLIENT_NAME_PARAM = 'client_name=dSocial';

export interface ProfileState {
  following: Following[];
  followers: Following[];
  accountName: string;
}

const initialState: ProfileState = {
  following: [],
  followers: [],
  accountName: "",
};

interface FollowsProps {
  following: Following[];
  followers: Following[];
}

export const followTxAndRedirectToSign = createAsyncThunk<void, { address: string, callerAddress: Uint8Array }, ThunkExtra>("profile/follow", async ({ address, callerAddress }, thunkAPI) => {
  console.log("Follow user: %s", address);
  const gnonative = thunkAPI.extra.gnonative;

  const fnc = "Follow";
  const args: Array<string> = [address];
  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);
  const callerAddressBech32 = await gnonative.addressToBech32(callerAddress);
  const reason = "Follow a user";
  const callbackPath = "/account";
  // const session = (thunkAPI.getState() as RootState).linking.session;

  // await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath, session }, thunkAPI.extra.gnonative);
  await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath }, thunkAPI.extra.gnonative);
});

export const unfollowTxAndRedirectToSign = createAsyncThunk<void, { address: string, callerAddress: Uint8Array }, ThunkExtra>("profile/follow", async ({ address, callerAddress }, thunkAPI) => {
  console.log("Follow user: %s", address);
  const gnonative = thunkAPI.extra.gnonative;

  const fnc = "Unfollow";
  const args: Array<string> = [address];
  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);
  const callerAddressBech32 = await gnonative.addressToBech32(callerAddress);
  const reason = "Unfollow a user";
  const callbackPath = "/account";
  // const session = (thunkAPI.getState() as RootState).linking.session;

  // await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath, session }, thunkAPI.extra.gnonative);
  await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath }, thunkAPI.extra.gnonative);
});

export const setFollows = createAsyncThunk("profile/setFollows", async ({ following, followers }: FollowsProps, _) => {
  return { following, followers };
});

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileAccountName: (state, action) => {
      state.accountName = action.payload;
    }
  },
  selectors: {
    selectProfileAccountName: (state) => state.accountName,
    selectFollowers: (state) => state.followers,
    selectFollowing: (state) => state.following,
  },
  extraReducers(builder) {
    builder.addCase(setFollows.fulfilled, (state, action) => {
      state.following = action.payload.following;
      state.followers = action.payload.followers;
    });
    builder.addCase(setFollows.rejected, (state, action) => {
      console.log("Error while fetching follows, please, check the logs. %s", action.error.message);
    });
  },
});

export const { setProfileAccountName } = profileSlice.actions;

export const { selectProfileAccountName, selectFollowers, selectFollowing } = profileSlice.selectors;
