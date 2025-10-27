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

    if (remoteURL !== "https://api.gno.berty.io:443") {
      Alert.alert(
        "Unsupported Remote URL",
        "This build supports only https://api.gno.berty.io:443. Please update your remote URL and try again."
      );
      return;
    }
    initIndexer("https://indexer.gno.berty.io");
    dispatch(loggedIn());
  }, [bech32AddressSelected]);

  useEffect(() => {
    if (loading) return
    if (account) {
      dispatch(clearLinking());
      route.replace("/home");
    }
  }, [account]);

  const signinUsingGnokey = async () => {
    await dispatch(requestLoginForGnokeyMobile()).unwrap();
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
        </Layout.BodyAlignedBotton>
      </Layout.Container>
    </>
  );
}
