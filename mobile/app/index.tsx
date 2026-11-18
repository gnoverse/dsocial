import { Alert, View } from "react-native";
import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Ruller from "@gno/components/row/Ruller";
import Text from "@gno/components/text";
import {
  clearLinking,
  loggedIn,
  requestLoginForGnokeyMobile,
  selectAccount,
  selectBech32AddressSelected,
  selectLoginLoading,
  selectRemoteURL,
  setLinkingData,
  setProfileAccountName,
  useAppDispatch,
  useAppSelector,
} from "@gno/redux";
import Spacer from "@gno/components/spacer";
import * as Application from "expo-application";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useIndexerContext } from "@gno/provider/indexer-provider";

export default function Root() {
  const dispatch = useAppDispatch();
  const route = useRouter();
  const bech32AddressSelected = useAppSelector(selectBech32AddressSelected);
  const remoteURL = useAppSelector(selectRemoteURL);
  const account = useAppSelector(selectAccount);
  const loading = useAppSelector(selectLoginLoading);

  const { initIndexer } = useIndexerContext();

  const appVersion = Application.nativeApplicationVersion;

  useEffect(() => {
    if (loading || !bech32AddressSelected || !remoteURL) return;
    console.log("bech32AddressSelected on index", bech32AddressSelected);
    // TODO: The remote indexer should come from the local network config.
    initIndexer("https://indexer.gno.berty.io");
    dispatch(loggedIn());
  }, [bech32AddressSelected]);

  useEffect(() => {
    if (loading) return
    if (account) {
      dispatch(clearLinking());
      // TEMP for testing: open the signed-in user's account page instead of the home feed.
      // route.replace("/home");
      dispatch(setProfileAccountName(account.name));
      route.replace("/account");
    }
  }, [account]);

  const signinUsingGnokey = async () => {
    await dispatch(requestLoginForGnokeyMobile()).unwrap();
  };

  const browseAsGuest = () => {
    // TODO: Properly use the local network config and set up the account as not signed in.
    // For now, bypass the round trip to Gnokey Mobile by simulating its sign-in callback.
    // TODO: After the sign-in flow is updated, make sure tapping this again in the same session (e.g. after
    // signing out) signs in again. Currently it doesn't, because clearLinking doesn't reset bech32AddressSelected
    // (it reassigns `state` instead of returning initialState), so the sign-in effect doesn't re-run.
    dispatch(setLinkingData({
      queryParams: {
        address: "g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5",
        chain_id: "dev",
        remote: "tcp://127.0.0.1:26657",
      },
    }));
  };

  return (
    <>
      <Layout.Container>
        <Layout.BodyAlignedBotton>
          <View style={{ alignItems: "center" }}>
            <Text.Title>dSocial</Text.Title>
            <Text.Body>Decentralized Social Network</Text.Body>
            <Text.Body>Powered by GnoNative</Text.Body>
            <Text.Caption1>v{appVersion}</Text.Caption1>
          </View>

          <View style={{ flex: 1 }}>
            {/* Hero copy */}
          </View>
          <Ruller />
          <Spacer />
          <Text.Caption1>Sign in using Gnokey Mobile:</Text.Caption1>
          <Button.TouchableOpacity title="Sign in" onPress={signinUsingGnokey} variant="primary" loading={loading} />
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
            <View style={{ flex: 1, height: 2, backgroundColor: "#e7e7e7" }} />
            <Text.Body style={{ marginHorizontal: 12, color: "#667386" }}>or</Text.Body>
            <View style={{ flex: 1, height: 2, backgroundColor: "#e7e7e7" }} />
          </View>
          <Button.TouchableOpacity title="Browse as Guest" onPress={browseAsGuest} variant="primary-green" />
        </Layout.BodyAlignedBotton>
      </Layout.Container>
    </>
  );
}
