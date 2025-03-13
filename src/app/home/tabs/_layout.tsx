import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"         
      options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="heart-outline" size={size} color={color} />
          ),
        }} />
      <Tabs.Screen name="media"         
      options={{
          tabBarLabel: "Media",
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="image-multiple-outline" size={size} color={color} />
          ),
        }} />
    </Tabs>
  );
}
