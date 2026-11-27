import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../utils/async-thunk";
import { makeCallTx } from "./linkingSlice";
import { Following } from "@gno/types";
import { ThunkExtra } from "redux/redux-provider";

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

interface FollowTxParams {
  address: string;
  callerAddressBech32: string;
}

export const followTxAndRedirectToSign = createAppAsyncThunk<string, FollowTxParams, ThunkExtra>(
  "profile/follow",
  ({ address, callerAddressBech32 }) => makeCallTx({ fnc: "Follow", args: [["followedAddr", address]], callerAddressBech32 })
);

export const unfollowTxAndRedirectToSign = createAppAsyncThunk<string, FollowTxParams, ThunkExtra>(
  "profile/unfollow",
  ({ address, callerAddressBech32 }) => makeCallTx({ fnc: "Unfollow", args: [["followedAddr", address]], callerAddressBech32 })
);

export const setFollows = createAppAsyncThunk("profile/setFollows", async ({ following, followers }: FollowsProps) => {
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
