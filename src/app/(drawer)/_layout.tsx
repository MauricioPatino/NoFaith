import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

const CustomDrawerContent = (props: any) => {
  const pathname = usePathname();

  useEffect(() => {
    console.log(pathname);
  }, [pathname]);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.userInfoWrapper}>
        <View style={styles.userDetailsWrapper}>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john@email.com</Text>
        </View>
      </View>
      <DrawerItem
        icon={({ size }) => (
          <Feather
            name="user"
            size={size}
            color={pathname === "/(drawer)/(tabs)" ? "#fff" : "#000"}
          />
        )}
        label="Profile"
        labelStyle={[
          styles.navItemLabel,
          { color: pathname === "/(drawer)/(tabs)" ? "#fff" : "#000" },
        ]}
        style={{ backgroundColor: pathname === "/(drawer)/(tabs)" ? "#333" : "#fff" }}
        onPress={() => {
          router.push("/(drawer)/(tabs)");
        }}
      />
    </DrawerContentScrollView>
  );
};

export default function Layout() {
  const navigation = useNavigation();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        ),
        headerShown: true, // Show the header so the menu button is visible
        drawerStyle: {
          backgroundColor: "#fff",
          width: 200,
        },
        swipeEnabled: true,
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          drawerLabel: "Home",
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  navItemLabel: {
    marginLeft: -5,
    fontSize: 20,
  },
  userInfoWrapper: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  userDetailsWrapper: {
    marginTop: 25,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 16,
    fontStyle: "italic",
    textDecorationLine: "underline",
  },
});
