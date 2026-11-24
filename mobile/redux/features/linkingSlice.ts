import { Post } from "@gno/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Linking from "expo-linking";
import { ThunkExtra } from "redux/redux-provider";
import { createAppAsyncThunk } from "../utils/async-thunk";
import { issueState } from "@gno/utils/callback-state";
import { CALLBACK_URL, LaunchHost, makeLaunchLink } from "@gno/utils/gnoconnect";
import { getActiveNetwork } from "@gno/utils/network-store";
import { broadcastSignedTx } from "@gno/utils/tm2-rpc";

const SOCIAL_REALM = "gno.land/r/berty/social";

/** The outcome of a transaction request, which is identified by the `state` of its launch link. */
export interface TxOutcome {
  state: string;
  status: "broadcasting" | "committed" | "failed";
}

interface State {
  bech32AddressSelected: string | undefined;
  chainId: string | undefined;
  lastTx: TxOutcome | undefined;
}

const initialState: State = {
  bech32AddressSelected: undefined,
  chainId: undefined,
  lastTx: undefined,
};

// Open the wallet and return the `state` which its callback will echo.
const openWallet = async (host: LaunchHost, params: [name: string, value: string][]): Promise<string> => {
  const network = getActiveNetwork();
  const state = issueState();
  const url = makeLaunchLink(host, [
    ...params,
    ["rpc", network.rpc],
    ["chainid", network.chainId],
    ["callback", CALLBACK_URL],
    ["state", state],
  ]);

  console.log("opening the wallet: %s", host);
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.log("openURL", error);
    throw new Error("Cannot open Gnokey Mobile. Is it installed?");
  }
  return state;
};

/** Ask the wallet for the user's address. It proves nothing: the authority is in the signed transactions. */
export const requestLoginForGnokeyMobile = createAppAsyncThunk<string, void, ThunkExtra>("tx/requestLoginForGnokeyMobile", () =>
  openWallet("connect", [])
);

export type MakeCallTxParams = {
  packagePath?: string;
  fnc: string;
  /** The names must be those of the function's parameters in the realm (without `cur realm`). */
  args: [name: string, value: string][];
  callerAddressBech32: string;
};

/**
 * Ask the wallet to sign a realm call (it chooses the gas). Return the `state` of the request. The
 * wallet's answer goes to LinkingProvider, which broadcasts it. See useWalletTx to follow the outcome.
 */
export const makeCallTx = ({ packagePath = SOCIAL_REALM, fnc, args, callerAddressBech32 }: MakeCallTxParams): Promise<string> =>
  openWallet("signtx", [
    ["path", packagePath],
    ["func", fnc],
    ...args.map(([name, value]): [string, string] => [`arg.${name}`, value]),
    // Pin the account, since the user can select another one in the wallet.
    ["signer", callerAddressBech32],
  ]);

type MakeTxAndRedirectParams = {
  postContent: string;
  callerAddressBech32: string;
};

export const postTxAndRedirectToSign = createAppAsyncThunk<string, MakeTxAndRedirectParams, ThunkExtra>(
  "tx/makeCallTxAndRedirectToSign",
  ({ callerAddressBech32, postContent }) =>
    makeCallTx({ fnc: "PostMessage", args: [["body", postContent]], callerAddressBech32 })
);

interface GnodCallTxParams {
  post: Post;
  callerAddressBech32: string;
}

export const gnodTxAndRedirectToSign = createAppAsyncThunk<string, GnodCallTxParams, ThunkExtra>(
  "tx/gnodTxAndRedirectToSign",
  ({ post, callerAddressBech32 }) =>
    makeCallTx({
      fnc: "AddReaction",
      args: [
        ["userPostsAddr", post.user_posts_addr],
        ["threadid", String(post.thread_id)],
        ["postid", String(post.id)],
        ["reaction", "0"],
      ],
      callerAddressBech32,
    })
);

/** Broadcast the transaction which the wallet signed for the request with this `state`. */
export const broadcastTx = createAppAsyncThunk<void, { state: string; signedTx: string }, ThunkExtra>(
  "tx/broadcastTx",
  ({ signedTx }) => broadcastSignedTx(getActiveNetwork().rpc, signedTx)
);

/**
 * Slice to handle linking between the app and the GnokeyMobile app
 */
export const linkingSlice = createSlice({
  name: "linking",
  initialState,
  reducers: {
    /** The wallet's answer to `connect`. */
    setLinkingData: (state, action: PayloadAction<{ address: string; chainId?: string }>) => {
      state.bech32AddressSelected = action.payload.address;
      state.chainId = action.payload.chainId;
    },
    /** The wallet's refusal of any request. `code` is the standard's enumerated reason. */
    walletFailed: (state, action: PayloadAction<{ state: string; status: string; code?: string }>) => {
      state.lastTx = { state: action.payload.state, status: "failed" };
    },
    clearLinking: (state) => {
      state.bech32AddressSelected = undefined;
      state.chainId = undefined;
    },
  },
  extraReducers(builder) {
    builder.addCase(broadcastTx.pending, (state, action) => {
      state.lastTx = { state: action.meta.arg.state, status: "broadcasting" };
    });
    builder.addCase(broadcastTx.fulfilled, (state, action) => {
      state.lastTx = { state: action.meta.arg.state, status: "committed" };
    });
    builder.addCase(broadcastTx.rejected, (state, action) => {
      state.lastTx = { state: action.meta.arg.state, status: "failed" };
    });
  },
  selectors: {
    selectBech32AddressSelected: (state: State) => state.bech32AddressSelected,
    selectLastTx: (state: State) => state.lastTx,
  },
});

export const { clearLinking, setLinkingData, walletFailed } = linkingSlice.actions;

export const { selectBech32AddressSelected, selectLastTx } = linkingSlice.selectors;
