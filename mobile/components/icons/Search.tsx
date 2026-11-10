import * as React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Search({ color = "rgb(245, 245, 245)" }: { color?: React.ComponentProps<typeof Ionicons>["color"] }) {
  return <Ionicons name="search" size={28} color={color} />;
}
