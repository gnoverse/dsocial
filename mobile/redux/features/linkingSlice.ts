import { Post } from "@gno/types";
import { GnoNativeApi } from "@gnolang/gnonative";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as Linking from 'expo-linking';
import { ThunkExtra } from "redux/redux-provider";

interface State {
    txJsonSigned: string | undefined;
    bech32AddressSelected: string | undefined;
}

const initialState: State = {
    txJsonSigned: undefined,
    bech32AddressSelected: undefined,
};

export const requestLoginForGnokeyMobile = createAsyncThunk<boolean>("tx/requestLoginForGnokeyMobile", async () => {
    const url = new URL('land.gno.gnokey://tosignin');
    url.searchParams.append('callback', 'tech.berty.dsocial://signin-callback');
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

    await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath }, thunkAPI.extra.gnonative);
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
};

export const makeCallTx = async (props: MakeCallTxParams, gnonative: GnoNativeApi): Promise<void> => {
    const { fnc, callerAddressBech32, gasFee, gasWanted, args, packagePath = "gno.land/r/berty/social", reason, callbackPath } = props;

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
    const gasWanted = BigInt(2000000);
    // post.user.address is in fact a bech32 address
    const args: Array<string> = [String(post.user.address), String(post.id), String(post.id), String("0")];
    const reason = "Gnoding a message";
    await makeCallTx({ fnc, args, gasFee, gasWanted, callerAddressBech32, reason, callbackPath }, thunkAPI.extra.gnonative);
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
        },
        clearLinking: (state) => {
            console.log("clearing linking data");
            state = { ...initialState };
        }
    },
    selectors: {
        selectQueryParamsTxJsonSigned: (state: State) => state.txJsonSigned as string | undefined,
        selectBech32AddressSelected: (state: State) => state.bech32AddressSelected as string | undefined,
    },
});

export const { clearLinking, setLinkingData } = linkingSlice.actions;

export const { selectQueryParamsTxJsonSigned, selectBech32AddressSelected } = linkingSlice.selectors;
