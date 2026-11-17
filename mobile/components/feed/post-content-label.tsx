import { colors } from "@gno/styles/colors";
import React from "react";
import Autolink, { CustomMatcher } from "react-native-autolink";

const PATTERN = /@([a-z]+[_a-z0-9]{5,})/g;

// A hashtag, with the same rules as forEachHashtag in the realm: a '#' followed by letters (with
// combining marks), digits or '_', with at least one letter. The '#' must not follow one of these
// or '&', '/' or '#' (to skip "a#b", "&#39;", "/#anchor" and "##a"). Group 1 is the hashtag without the '#'.
const HASHTAG_PATTERN = /(?<![\p{L}\p{M}\p{Nd}_&\/#])#([\p{L}\p{M}\p{Nd}_]*\p{L}[\p{L}\p{M}\p{Nd}_]*)/gu;

type Props = {
  onMentionPress?: (accountName: string) => void;
  // Called with the hashtag without the '#'.
  onHashtagPress?: (hashtag: string) => void;
  children: string;
};

const PostContentLabel: React.FC<Props> = ({ children, onMentionPress, onHashtagPress }) => {
  return (
    <Autolink
      text={children}
      email={true}
      url={true}
      matchers={[
        {
          pattern: PATTERN,
          style: { color: colors.blue, fontWeight: "bold" },
          getLinkText: (replacerArgs) => `@${replacerArgs[1]}`,
          onPress: (match) => {
            console.log("Pressed mention1 ", match);

            const accountNameM1 = match.getReplacerArgs()[0];
            const accountName = accountNameM1.replace("@", "");

            onMentionPress ? onMentionPress(accountName) : null;
          },
        },
        {
          pattern: HASHTAG_PATTERN,
          style: { color: colors.blue, fontWeight: "bold" },
          onPress: (match) => {
            const hashtag = match.getReplacerArgs()[1];
            onHashtagPress ? onHashtagPress(hashtag) : null;
          },
        },
      ]}
    />
  );
};

export default PostContentLabel;
