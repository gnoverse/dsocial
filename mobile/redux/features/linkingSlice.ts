import { Post } from "@gno/types";
import { GnoNativeApi } from "@gnolang/gnonative";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as Linking from 'expo-linking';
import { RootState, ThunkExtra } from "redux/redux-provider";

interface State {
    txJsonSigned: string | undefined;
    bech32AddressSelected: string | undefined;
    session: string | undefined;
}

const initialState: State = {
    txJsonSigned: undefined,
    bech32AddressSelected: undefined,
    session: undefined,
};

export const requestLoginForGnokeyMobile = createAsyncThunk<boolean>("tx/requestLoginForGnokeyMobile", async () => {
    const url = new URL('land.gno.gnokey://tosignin');
    url.searchParams.append('callback', 'tech.berty.dsocial://signin-callback');
    url.searchParams.append('client_name', 'dSocial');
    console.log("redirecting to: ", url);
    return await Linking.openURL(url.toString());
})

type MakeTxAndRedirectParams = {
    postContent: string,
    callerAddressBech32: string,
};

export const postTxAndRedirectToSign = createAsyncThunk<void, MakeTxAndRedirectParams, ThunkExtra>("tx/makeCallTxAndRedirectToSign", async (props, thunkAPI) => {
    const { callerAddressBech32, postContent } = props;

    const fnc = "PostMessage";
    const args: Array<string> = [postContent];
    const gasFee = "1000000ugnot";
    const gasWanted = BigInt(10000000);
    const reason = "Post a message";
    const callbackPath = "/post";
    const session = (thunkAPI.getState() as RootState).linking.session;

    await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath, session }, thunkAPI.extra.gnonative);
})

type MakeCallTxParams = {
    packagePath?: string,
    fnc: string,
    args: string[],
    gasFee: string,
    gasWanted: bigint,
    send?: string,
    memo?: string,
    callerAddressBech32: string,
    reason: string,
    callbackPath: string,
    session?: string,
};

export const makeCallTx = async (props: MakeCallTxParams, gnonative: GnoNativeApi): Promise<void> => {
    const { fnc, callerAddressBech32, gasFee, gasWanted, args, packagePath = "gno.land/r/berty/social", reason, callbackPath, session } = props;

    console.log("making a tx for: ", callerAddressBech32);
    const address = await gnonative.addressFromBech32(callerAddressBech32);

    const res =  await gnonative.makeCallTx(packagePath, fnc, args, gasFee, gasWanted, address)

    const url = new URL('land.gno.gnokey://tosign');
    url.searchParams.append('chain_id', await gnonative.getChainID());
    url.searchParams.append('remote', await gnonative.getRemote());
    url.searchParams.append('tx', res.txJson);
    url.searchParams.append('address', callerAddressBech32);
    url.searchParams.append('client_name', 'dSocial');
    url.searchParams.append('reason', reason);
    url.searchParams.append('callback', 'tech.berty.dsocial:/' + callbackPath);
    if (session) {
        // Avoid edge case when the session is about to expire
        const sessionInfo = JSON.parse(decodeURIComponent(session))
        const secondsToExpire = (new Date(sessionInfo.expires_at).getTime() - new Date().getTime()) / 1000;
        if (secondsToExpire < 30) {
            url.searchParams.append('session_wanted', 'true');
        } else {
            // TODO: temporarily passing the session key. This should be removed once the session is used to self sign the tx
            url.searchParams.append('session', session);
        }
    } else {
        url.searchParams.append('session_wanted', 'true');
    }

    console.log("redirecting to: ", url);
    Linking.openURL(url.toString());
}

export const broadcastTxCommit = createAsyncThunk<void, string, ThunkExtra>("tx/broadcastTxCommit", async (signedTx, thunkAPI) => {
    console.log("broadcasting tx: ", signedTx);

    const gnonative = thunkAPI.extra.gnonative;
    const res = await gnonative.broadcastTxCommit(signedTx);
    console.log("broadcasted tx: ", res);
});

interface GnodCallTxParams {
    post: Post,
    callerAddressBech32: string,
    callbackPath: string,
}

export const gnodTxAndRedirectToSign = createAsyncThunk<void, GnodCallTxParams, ThunkExtra>("tx/gnodTxAndRedirectToSign", async (props, thunkAPI) => {
    console.log("gnodding post: ", props.post);
    const { post, callerAddressBech32, callbackPath } = props;

    const fnc = "AddReaction";
    const gasFee = "1000000ugnot";
    const gasWanted = BigInt(10000000);
    // post.user.address is in fact a bech32 address
    const args: Array<string> = [String(post.user.address), String(post.id), String(post.id), String("0")];
    const reason = "Gnoding a message";
    const session = (thunkAPI.getState() as RootState).linking.session;

    await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath, session }, thunkAPI.extra.gnonative);
});

/**
 * Slice to handle linking between the app and the GnokeyMobile app
 */
export const linkingSlice = createSlice({
    name: "linking",
    initialState,
    reducers: {
        setLinkingData: (state, action) => {
            const queryParams = action.payload.queryParams

            state.bech32AddressSelected = queryParams?.address ? queryParams.address as string : undefined
            state.txJsonSigned = queryParams?.tx ? queryParams.tx as string : undefined
            state.session = queryParams?.session ? queryParams.session as string : state.session
        },
        clearLinking: (state) => {
            console.log("clearing linking data");
            state = { ...initialState };
        }
    },
    selectors: {
        selectQueryParamsTxJsonSigned: (state: State) => state.txJsonSigned as string | undefined,
        selectBech32AddressSelected: (state: State) => state.bech32AddressSelected as string | undefined,
        selectSessionValidUntil: (state: State) => {
            const session = state.session;
            if (!session) return undefined;
            const sessionInfo = JSON.parse(decodeURIComponent(session));
            return new Date(sessionInfo.expires_at);
        }
    },
});

export const { clearLinking, setLinkingData } = linkingSlice.actions;

export const { selectQueryParamsTxJsonSigned, selectBech32AddressSelected,
  selectSessionValidUntil
 } = linkingSlice.selectors;
