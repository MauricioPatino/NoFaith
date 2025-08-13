import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"         
      options={{
          tabBarLabel: "Feed",
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="heart-outline" size={size} color={color} />
          ),
        }} />
      <Tabs.Screen name="media"         
      options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }} />
    </Tabs>
  );
}
