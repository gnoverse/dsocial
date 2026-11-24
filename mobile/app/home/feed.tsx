import { ActivityIndicator, FlatList, Platform, StyleSheet, View, Alert as RNAlert, SafeAreaView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useFeed } from "@gno/hooks/use-feed";
import Layout from "@gno/components/layout";
import useScrollToTop from "@gno/components/utils/useScrollToTopWithOffset";
import Button from "@gno/components/button";
import { Post } from "@gno/types";
import { gnodTxAndRedirectToSign, selectAccount, setPostToReply, useAppDispatch, useAppSelector } from "@gno/redux";
import Alert from "@gno/components/alert";
import Text from "@gno/components/text";
import { FeedView } from "@gno/components/view";
import { useWalletTx } from "@gno/hooks/use-wallet-tx";
import { useActiveNetwork } from "@gno/utils/network-store";

export default function Page() {
  const [totalPosts, setTotalPosts] = useState(0);
  const [error, setError] = useState<unknown | Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const navigation = useNavigation();
  const feed = useFeed();
  const ref = useRef<FlatList>(null);
  const dispatch = useAppDispatch();

  const account = useAppSelector(selectAccount);
  const network = useActiveNetwork();

  useScrollToTop(ref, Platform.select({ ios: -150, default: 0 }));

  const fetchData = async () => {
    if (!account) return;
    setError(undefined);
    setIsLoading(true);
    try {
      // Without an indexer, there is no feed to fetch. See below.
      if (network.indexer) {
        const total = await feed.fetchCount(account.bech32);
        setTotalPosts(total);
      }
    } catch (error) {
      RNAlert.alert("Error while fetching posts.", " " + error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return navigation.addListener("focus", fetchData);
  }, [navigation, account, network]);

  const gnodTx = useWalletTx(fetchData);

  const onPressPost = () => {
    router.navigate({ pathname: "/post" });
  };

  const onPress = async (p: Post) => {
    await dispatch(setPostToReply(p));
    router.navigate({ pathname: "/post/[post_id]" });
  };

  const onGnod = async (post: Post) => {
    if (!account) throw new Error("No active account");
    await gnodTx.send(gnodTxAndRedirectToSign({ post, callerAddressBech32: account.bech32 }));
  };

  if (isLoading)
    return (
      <Layout.Container>
        <Layout.Body>
          <ActivityIndicator size="large" color="#0000ff" />
        </Layout.Body>
      </Layout.Container>
    );

  if (error)
    return (
      <Layout.Container>
        <Layout.Body>
          <Alert severity="error" message="Error while fetching posts, please, check the logs." />
        </Layout.Body>
      </Layout.Container>
    );

  if (!account) {
    return (
      <Layout.Container>
        <Layout.Body>
          <Alert severity="error" message="No user found." />
        </Layout.Body>
      </Layout.Container>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.select({ ios: 0, default: 20 }) }}>
      <View style={styles.container}>
        {network.indexer ? (
          <FeedView totalPosts={totalPosts} onPress={onPress} onGnod={onGnod} bech32={account.bech32} type="userFeed" />
        ) : (
          <View style={styles.noIndexer}>
            <Text.Body>The feed needs an indexer, and none is set for the network "{network.label}".</Text.Body>
            <Button.TouchableOpacity title="Network settings" onPress={() => router.navigate("/network")} variant="primary" />
          </View>
        )}
        <Button.TouchableOpacity title="Post" onPress={onPressPost} style={styles.post} variant="primary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  flatListContent: {
    paddingBottom: 60, // Adjust the value to ensure it's above the app menu
  },
  noIndexer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  post: {
    position: "absolute",
    width: 60,
    height: 60,
    bottom: 40,
    right: 20,
  },
});
