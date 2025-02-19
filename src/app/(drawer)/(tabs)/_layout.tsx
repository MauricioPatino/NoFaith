import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarLabelStyle: {
          fontFamily: "mon-sb",
        },
        headerShown: false, // Drawer already handles the header
        tabBarStyle: {
          display: "flex",
          height: 60,
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          tabBarLabel: "Media",
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="image-multiple-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatroom"
        options={{
          tabBarLabel: "Chatroom",
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="message-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default Layout;
