import { StyleSheet, View } from "react-native";
import Text from "@gno/components/text";
import { colors } from "@gno/styles/colors";
import { Post } from "@gno/types";
import FeedView from "../feed/feed-view";

interface Props {
  onPressPost: (post: Post) => void;
  onGnod: (post: Post) => void;
  // The hashtag without the '#'.
  hashtag: string;
  totalPosts: number;
}

// Show the posts from all users with the hashtag.
function HashtagView(props: Props) {
  const { onPressPost, onGnod, hashtag, totalPosts } = props;

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", marginHorizontal: 16, gap: 8 }}>
        <Text.Title>#{hashtag}</Text.Title>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Text.Body style={{ fontWeight: "bold" }}>{totalPosts}</Text.Body>
          <Text.Body>{totalPosts === 1 ? "Post" : "Posts"}</Text.Body>
        </View>
      </View>
      <View style={{ flex: 1, width: "100%", paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{ height: 1, backgroundColor: colors.grayscale[200] }} />
        <FeedView totalPosts={totalPosts} onPress={onPressPost} onGnod={onGnod} hashtag={hashtag} type="hashtagPosts" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: 16,
    backgroundColor: colors.grayscale[100],
  },
});

export default HashtagView;
