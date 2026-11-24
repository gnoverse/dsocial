import { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dismissFeedback, selectCurrentFeedback, useAppDispatch, useAppSelector } from "@gno/redux";
import Text from "@gno/components/text";
import Icons from "@gno/components/icons";

const VISIBLE_MS = { error: 6000, success: 3000 };

/** Show the feedback queue. It is at the app's root since the screen which caused a message may be gone. */
export default function FeedbackSnackbar() {
  const feedback = useAppSelector(selectCurrentFeedback);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => dispatch(dismissFeedback(feedback.id)), VISIBLE_MS[feedback.kind]);
    return () => clearTimeout(timer);
  }, [feedback?.id]);

  if (!feedback) return null;

  const color = feedback.kind === "error" ? "#7A1A1C" : "#0B5132";

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
      <View style={[styles.snackbar, feedback.kind === "error" ? styles.error : styles.success]} accessibilityRole="alert">
        <Text.Body style={{ flex: 1, color }} numberOfLines={4}>
          {feedback.message}
        </Text.Body>
        <TouchableOpacity
          onPress={() => dispatch(dismissFeedback(feedback.id))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <Icons.Close color={color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    // Not at the bottom, where the keyboard would hide it.
    top: 0,
    paddingHorizontal: 16,
  },
  snackbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  error: { backgroundColor: "#FFE5E6", borderColor: "#FA262A" },
  success: { backgroundColor: "#E5F9E5", borderColor: "#00A86B" },
});
