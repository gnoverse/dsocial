import * as React from "react";
import { AntDesign } from "@expo/vector-icons";

const Profile = ({ color = "rgb(245, 245, 245)" }: { color?: React.ComponentProps<typeof AntDesign>["color"] }) => (
  <AntDesign name="profile" size={24} color={color} />
);

export default Profile;
