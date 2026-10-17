import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import clsx from "clsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tabs, type TabIconProps } from "../../constants/data";
import { colors, components } from "../../constants/theme";

const tabBar = components.tabBar;

type TabIconProps = {
  focused: boolean;
  icon: any;
};

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View
        className={clsx(
          "tabs-pill",
          focused && "tabs-active"
        )}
      >
        <Image className="tabs-glyph" source={icon} resizeMode = "contain" />
      </View>
    </View>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(
            insets.bottom,
            tabBar.horizontalInset
          ),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth:0,
          elivation:0,
        },
        tabBarItemStyle:{
          paddingVertical:tabBar.height / 2 - tabBar.iconFrame/2.4
        },
        tabBarIconStyle:{
          width:tabBar.IconFrame,
          height:tabBar.IconFrame,
          alignmentItem:'center'
        }
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}