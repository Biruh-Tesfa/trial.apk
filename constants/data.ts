import type { ImageSourcePropType } from "react-native";

import { icons } from "./icons";

export type TabIconProps = {
  focused: boolean;
  icon: ImageSourcePropType;
};

export const tabs = [
  {
    name: "index",
    title: "Home",
    icon: icons.home,
  },
  {
    name: "subscriptions",
    title: "Subscriptions",
    icon: icons.wallet,
  },
  {
    name: "insight",
    title: "Insight",
    icon: icons.activity,
  },
  {
    name: "settings",
    title: "Settings",
    icon: icons.setting,
  },
];