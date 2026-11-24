import Button from "@gno/components/button";
import { PostRow } from "@gno/components/feed/post-row";
import Layout from "@gno/components/layout";
import TextInput from "@gno/components/textinput";
import { repostTxAndRedirectToSign, selectAccount, selectPostToReply, useAppSelector } from "@gno/redux";
import { useWalletTx } from "@gno/hooks/use-wallet-tx";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function Page() {
  const post = useAppSelector(selectPostToReply);
  const router = useRouter();

  const [replyContent, setReplyContent] = useState("");
  // True while waiting for the indexer.
  const [indexing, setIndexing] = useState(false);

  const account = useAppSelector(selectAccount);

  const repostTx = useWalletTx(() => {
    setIndexing(true);
    // Let the indexer see the repost before showing the feed.
    setTimeout(() => router.dismissTo("/home/feed"), 3000);
  });

  const onPressRepost = async () => {
    if (!post) return;

    if (!account) throw new Error("No active account");

    await repostTx.send(repostTxAndRedirectToSign({ post, replyContent, callerAddressBech32: account.bech32 }));
  };

  return (
    <Layout.Container>
      <Layout.Header title="Repost" />
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", padding: 16 }}>
        <View style={{ flex: 4 }} />
        <Button.TouchableOpacity
          loading={repostTx.pending || indexing}
          disabled={repostTx.pending || indexing}
          style={{ flex: 1 }}
          variant="primary"
          title="Repost"
          onPress={onPressRepost}
        ></Button.TouchableOpacity>
      </View>
      <Layout.Body>
        <TextInput
          placeholder="Add a comment"
          onChangeText={setReplyContent}
          value={replyContent}
          autoCapitalize={"none"}
          textAlign="left"
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
        />

        <PostRow post={post} showFooter={false} />
      </Layout.Body>
    </Layout.Container>
  );
}
