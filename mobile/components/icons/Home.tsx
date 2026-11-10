import * as React from "react";
import { AntDesign } from "@expo/vector-icons";

const Home = ({ color = "rgb(245, 245, 245)" }: { color?: React.ComponentProps<typeof AntDesign>["color"] }) => <AntDesign name="home" size={24} color={color} />;

export default Home;
