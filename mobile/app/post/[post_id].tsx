import { useEffect, useState } from "react";
import { useNavigation, usePathname, useRouter } from "expo-router";
import Text from "@gno/components/text";
import { broadcastTxCommit, clearLinking, gnodTxAndRedirectToSign, replyTxAndRedirectToSign, selectAccount, selectPostToReply, selectQueryParamsTxJsonSigned, useAppDispatch, useAppSelector } from "@gno/redux";
import Layout from "@gno/components/layout";
import TextInput from "@gno/components/textinput";
import Button from "@gno/components/button";
import Spacer from "@gno/components/spacer";
import Alert from "@gno/components/alert";
import { PostRow } from "@gno/components/feed/post-row";
import { FlatList, KeyboardAvoidingView, View } from "react-native";
import { Post } from "@gno/types";
import { useFeed } from "@gno/hooks/use-feed";

function Page() {
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [posting, setPosting] = useState<boolean>(false);
  const [thread, setThread] = useState<Post[]>([]);

  const post = useAppSelector(selectPostToReply);
  const txJsonSigned = useAppSelector(selectQueryParamsTxJsonSigned);
  const account = useAppSelector(selectAccount);
  const navigation = useNavigation();

  const feed = useFeed();
  const router = useRouter();

  const pathName = usePathname();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchData();
  }, [post]);

  useEffect(() => {

    (async () => {
      if (txJsonSigned) {
        console.log("txJsonSigned in [post_id] screen:", txJsonSigned);
        const signedTx = decodeURIComponent(txJsonSigned as string)
        try {
          dispatch(clearLinking());
          await dispatch(broadcastTxCommit(signedTx)).unwrap();
        } catch (error) {
          console.error("on broadcastTxCommit", error);
        } finally {
          fetchData();
        }
      }
    })();

  }, [txJsonSigned]);

  const fetchData = async () => {
    if (!post) return;

    console.log("fetching post: ", post.user.address);
    setLoading("Loading post...");
    try {
      const thread = await feed.fetchThread(String(post.user.address), Number(post.id));
      setThread(thread.data);
    } catch (error) {
      console.error("failed on [post_id].tsx screen", error);
      setError("" + error);
    } finally {
      setLoading(undefined);
    }
  };

  const onPressReply = async () => {
    if (!post) return;

    setLoading(undefined);
    setError(undefined);
    setPosting(true);

    if (!account) throw new Error("No active account"); // never happens, but just in case

    try {
      await dispatch(replyTxAndRedirectToSign({ post, replyContent, callerAddressBech32: account.bech32, callbackPath: pathName })).unwrap();
      setReplyContent("");
      await fetchData();
    } catch (error) {
      console.error("on post screen", error);
      setError("" + error);
    } finally {
      setPosting(false);
    }
  };

  const onPressPost = (post: Post) => {
    // TODO: on press a post inside the reply thread
  };

  const onGnod = async (post: Post) => {
    if (!account) throw new Error("No active account");
    dispatch(gnodTxAndRedirectToSign({ post, callerAddressBech32: account.bech32, callbackPath: pathName }))
  };

  if (!post || !post.user) {
    return (
      <Layout.Container>
        <Layout.Header title="Post" iconType="back" />
        <Layout.Body>
          <Alert severity="error" message="Error while fetching posts, please, check the logs." />
        </Layout.Body>
      </Layout.Container>
    );
  }

  return (
    <Layout.Container>
      <Layout.Header title="Post" iconType="back" />
      <Layout.Body>
        <PostRow post={post} showFooter={false} />

        <View style={{ flex: 1 }}>
          {loading ? (
            <Text.Body style={{ flex: 1, textAlign: "center", paddingTop: 42 }}>{loading}</Text.Body>
          ) : (
            <FlatList
              scrollToOverflowEnabled
              data={thread}
              keyExtractor={(item) => `${item.id}`}
              contentContainerStyle={{ width: "100%", paddingBottom: 20 }}
              renderItem={({ item }) => <PostRow post={item} onPress={onPressPost} onGnod={onGnod} />}
              onEndReachedThreshold={0.1}
            />
          )}
        </View>

        <Text.Body>Replying to {post?.user.name}</Text.Body>
        <Spacer />
        <KeyboardAvoidingView behavior="padding">
          <TextInput
            placeholder="Post your reply here..."
            onChangeText={setReplyContent}
            value={replyContent}
            autoCapitalize={"none"}
            textAlign="left"
            multiline
            numberOfLines={3}
            style={{ height: 80 }}
          />
          <Button.TouchableOpacity loading={posting} title="Reply" variant="primary" onPress={onPressReply} />
          <Spacer space={16} />
          <Button.TouchableOpacity title="Back" onPress={() => router.back()} variant="secondary" />
          <Alert severity="error" message={error} />
          <Spacer space={16} />
        </KeyboardAvoidingView>
      </Layout.Body>
    </Layout.Container>
  );
}

export default Page;
