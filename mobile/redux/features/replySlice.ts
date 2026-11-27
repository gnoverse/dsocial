import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../utils/async-thunk";
import { makeCallTx } from "./linkingSlice";
import { Post } from "@gno/types";
import { ThunkExtra } from "redux/redux-provider";

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

export const repostTxAndRedirectToSign = createAppAsyncThunk<string, RepostTxAndRedirectParams, ThunkExtra>(
  "tx/repostTxAndRedirectToSign",
  ({ post, replyContent, callerAddressBech32 }) =>
    makeCallTx({
      fnc: "RepostThread",
      args: [
        ["userPostsAddr", post.user_posts_addr],
        // Only a top-level thread can be reposted, so thread_id is the same as id.
        ["threadid", String(post.thread_id)],
        ["comment", replyContent],
      ],
      callerAddressBech32,
    })
);

type ReplytTxAndRedirectParams = {
  post: Post;
  replyContent: string;
  callerAddressBech32: string;
};

export const replyTxAndRedirectToSign = createAppAsyncThunk<string, ReplytTxAndRedirectParams, ThunkExtra>(
  "tx/replyTxAndRedirectToSign",
  ({ post, replyContent, callerAddressBech32 }) =>
    makeCallTx({
      fnc: "PostReply",
      args: [
        ["userPostsAddr", post.user_posts_addr],
        ["threadid", String(post.thread_id)],
        // For a reply, this adds a sub reply to it in the thread.
        ["postid", String(post.id)],
        ["body", replyContent],
      ],
      callerAddressBech32,
    })
);

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
