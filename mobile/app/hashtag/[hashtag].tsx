import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation, usePathname } from "expo-router";
import { HashtagView } from "@gno/components/view";
import { Post } from "@gno/types";
import {
  broadcastTxCommit,
  clearLinking,
  gnodTxAndRedirectToSign,
  selectAccount,
  selectQueryParamsTxJsonSigned,
  setPostToReply,
  useAppDispatch,
  useAppSelector,
} from "@gno/redux";
import { useFeed } from "@gno/hooks/use-feed";
import ErrorView from "@gno/components/view/account/no-account-view";
import Layout from "@gno/components/layout";

// Show the posts with the hashtag. Navigate here with
// router.navigate({ pathname: "/hashtag/[hashtag]", params: { hashtag } }) where hashtag is without the '#'.
export default function Page() {
  const { hashtag } = useLocalSearchParams<{ hashtag: string }>();

  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [totalPosts, setTotalPosts] = useState<number | undefined>(undefined);

  const navigation = useNavigation();
  const feed = useFeed();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectAccount);
  const txJsonSigned = useAppSelector(selectQueryParamsTxJsonSigned);

  const pathName = usePathname();

  useEffect(() => {
    (async () => {
      if (txJsonSigned) {
        console.log("txJsonSigned in hashtag page: ", txJsonSigned);
        const signedTx = decodeURIComponent(txJsonSigned as string);
        try {
          await dispatch(broadcastTxCommit(signedTx)).unwrap();
        } catch (error) {
          console.error("on broadcastTxCommit", error);
        }

        dispatch(clearLinking());
        fetchData();
      }
    })();
  }, [txJsonSigned]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await fetchData();
    });
    return unsubscribe;
  }, [hashtag]);

  const fetchData = useCallback(async () => {
    if (!hashtag) return;

    try {
      setLoading("Loading posts...");
      setError(undefined);
      // Set startIndex and endIndex to 0 to just get the n_posts.
      const r = await feed.fetchHashtagPosts(hashtag, 0, 0);
      setTotalPosts(r.n_posts);
    } catch (error: unknown | Error) {
      console.error(error);
      setError("" + error);
    } finally {
      setLoading(undefined);
    }
  }, [hashtag]);

  const onGnod = async (post: Post) => {
    console.log("gnodding post: ", post);
    setLoading("Gnoding...");

    if (!currentUser) throw new Error("No active account");

    dispatch(gnodTxAndRedirectToSign({ post, callerAddressBech32: currentUser.bech32, callbackPath: pathName })).unwrap();
  };

  const onPressPost = async (item: Post) => {
    await dispatch(setPostToReply(item));
    // Posts come from the indexer, the address is a bech32 address.
    router.navigate({ pathname: "/post/[post_id]", params: { post_id: item.id, address: String(item.user.address) } });
  };

  return (
    <Layout.Container>
      <Layout.Header iconType="back" />
      {error || loading || !hashtag || totalPosts === undefined ? (
        <ErrorView message={error} />
      ) : (
        <HashtagView hashtag={hashtag} totalPosts={totalPosts} onGnod={onGnod} onPressPost={onPressPost} />
      )}
    </Layout.Container>
  );
}
