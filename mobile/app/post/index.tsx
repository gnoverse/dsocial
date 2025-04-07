import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { broadcastTxCommit, clearLinking, postTxAndRedirectToSign, selectAccount, selectQueryParamsTxJsonSigned, useAppDispatch, useAppSelector } from "@gno/redux";
import { SessionCountDown } from "@gno/components/counter/session-countdown";

export default function Search() {
  const [postContent, setPostContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectAccount);
  // const sessionInMinutes = useAppSelector(selectSessionValidUntil);

  const txJsonSigned = useAppSelector(selectQueryParamsTxJsonSigned);

  // hook to handle the signed tx from the Gnokey and broadcast it
  useEffect(() => {
    const handleSignedTx = async () => {
      if (txJsonSigned) {
        const signedTx = decodeURIComponent(txJsonSigned as string);
        console.log("signedTx: ", signedTx);

        try {
          setLoading(true);
          await dispatch(clearLinking())
          await dispatch(broadcastTxCommit(signedTx))
          setTimeout(() => {
            router.push("home");
          }, 3000);
        } catch (error) {
          console.error("on broadcastTxCommit", error);
          setError("" + error);
        }
      }
    };
    handleSignedTx();
  }, [txJsonSigned]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPostContent("");
      setLoading(false);
      if (!account) throw new Error("No active account");
    });
    return unsubscribe;
  }, [navigation]);

  const onPressPost = async () => {
    if (!account || !account.bech32) throw new Error("No active account: " + JSON.stringify(account));
    await dispatch(postTxAndRedirectToSign({ callerAddressBech32: account.bech32, postContent })).unwrap();
  }

  return (
    <Layout.Container>
      <Layout.BodyAlignedBotton>
        <Button.TouchableOpacity title="Cancel" onPress={() => router.back()} variant="text" style={{ width: 100 }} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Text.Title>Let's post a message on the Gno Blockchain!</Text.Title>
          <Spacer />
          <SessionCountDown time={undefined} />
          <Spacer />
          <TextInput
            placeholder="What's happening?"
            onChangeText={setPostContent}
            value={postContent}
            multiline
            numberOfLines={4}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            style={{ height: 200 }}
          />
          <Spacer space={24} />
          <Button.TouchableOpacity loading={loading} title="Post" variant="primary" onPress={onPressPost} />
          <Spacer space={48} />
        </KeyboardAvoidingView>
      </Layout.BodyAlignedBotton>
    </Layout.Container>
  );
}
