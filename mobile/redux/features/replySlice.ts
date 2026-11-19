import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { makeCallTx } from "./linkingSlice";
import { Post } from "@gno/types";
import { RootState, ThunkExtra } from "redux/redux-provider";

export interface State {
  postToReply: Post | undefined;
}

const initialState: State = {
  postToReply: undefined,
};

interface RepostTxAndRedirectParams {
  post: Post;
  replyContent: string;
  callerAddressBech32: string;
}

export const repostTxAndRedirectToSign = createAsyncThunk<void, RepostTxAndRedirectParams, ThunkExtra>("tx/repostTxAndRedirectToSign", async (props, thunkAPI) => {
  const { post, replyContent, callerAddressBech32 } = props;

  const fnc = "RepostThread";
  // Only a top-level thread can be reposted, so thread_id is the same as id.
  const args: Array<string> = [post.user_posts_addr, String(post.thread_id), replyContent];
  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);
  const reason = "Repost a message";
  const callbackPath = "/repost";
  // const session = (thunkAPI.getState() as RootState).linking.session;

  // await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath, session }, thunkAPI.extra.gnonative);
  await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath }, thunkAPI.extra.gnonative);
})

type ReplytTxAndRedirectParams = {
  post: Post;
  replyContent: string;
  callerAddressBech32: string;
  callbackPath: string;
}

export const replyTxAndRedirectToSign = createAsyncThunk<void, ReplytTxAndRedirectParams, ThunkExtra>("tx/replyTxAndRedirectToSign", async (props, thunkAPI) => {
  const { post, replyContent, callerAddressBech32, callbackPath } = props;

  const fnc = "PostReply";
  const gasFee = "1000000ugnot";
  const gasWanted = BigInt(10000000);
  // For a reply, this adds a sub reply to it in the thread.
  const args: Array<string> = [post.user_posts_addr, String(post.thread_id), String(post.id), replyContent];
  const reason = "Reply a message";
  // const session = (thunkAPI.getState() as RootState).linking.session;

  // await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath, session }, thunkAPI.extra.gnonative);
  await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath }, thunkAPI.extra.gnonative);
})

export const replySlice = createSlice({
  name: "reply",
  initialState,
  reducers: {
    setPostToReply: (state, action: PayloadAction<Post>) => {
      state.postToReply = action.payload;
    }
  },
  selectors: {
    selectPostToReply: (state) => state.postToReply,
  }
});

export const { setPostToReply } = replySlice.actions;
export const { selectPostToReply } = replySlice.selectors;
