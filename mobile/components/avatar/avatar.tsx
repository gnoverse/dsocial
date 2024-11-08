import { View, Image, StyleSheet, StyleProp, ImageStyle } from "react-native";

interface Props {
  uri?: string;
  style?: StyleProp<ImageStyle>;
}

const defaultAvatar = require("../../assets/images/icon.png");

const Avatar: React.FC<Props> = ({ uri, style }) => {
  const hasUri = uri && uri.length > 0 && uri !== "undefined";

  return (
    <View>
      <Image source={hasUri ? { uri } : defaultAvatar} style={[styles.image, style]} />
    </View>
  );
};

const SIZE = 80;

const styles = StyleSheet.create({
  image: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE,
  },
});

export default Avatar;
