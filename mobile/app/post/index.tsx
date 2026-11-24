import Button from "@gno/components/button";
import Layout from "@gno/components/layout";
import Spacer from "@gno/components/spacer";
import Text from "@gno/components/text";
import TextInput from "@gno/components/textinput";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { postTxAndRedirectToSign, selectAccount, useAppSelector } from "@gno/redux";
import { useWalletTx } from "@gno/hooks/use-wallet-tx";
import { SessionCountDown } from "@gno/components/counter/session-countdown";

export default function Search() {
  const [postContent, setPostContent] = useState("");
  // True while waiting for the indexer.
  const [indexing, setIndexing] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();
  const account = useAppSelector(selectAccount);
  // const sessionInMinutes = useAppSelector(selectSessionValidUntil);

  const postTx = useWalletTx(() => {
    setIndexing(true);
    // Let the indexer see the post before showing the feed.
    setTimeout(() => router.dismissTo("/home/feed"), 3000);
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setPostContent("");
      setIndexing(false);
      if (!account) throw new Error("No active account");
    });
    return unsubscribe;
  }, [navigation]);

  const onPressPost = async () => {
    if (!account || !account.bech32) throw new Error("No active account: " + JSON.stringify(account));
    await postTx.send(postTxAndRedirectToSign({ callerAddressBech32: account.bech32, postContent }));
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
          <Button.TouchableOpacity loading={postTx.pending || indexing} disabled={postTx.pending || indexing} title="Post" variant="primary" onPress={onPressPost} />
          <Spacer space={48} />
        </KeyboardAvoidingView>
      </Layout.BodyAlignedBotton>
    </Layout.Container>
  );
}
