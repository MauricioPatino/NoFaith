import { Feather } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { View, StyleSheet, Text } from "react-native";
const CustomDrawerContent = (props: any) => {
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
            color={"#fff"}
          />
        )}
        label="Home"
        labelStyle={[
          styles.navItemLabel,
          { color: "#fff" },
        ]}
        style={{ backgroundColor: "#000", marginTop: 10 }}
        onPress={() => {
          router.push("/home/tabs");
        }}
      />
      <DrawerItem
        icon={({ size }) => (
          <Feather
            name="settings"
            size={size}
            color={"#fff"}
          />
        )}
        label="Settings"
        labelStyle={[
          styles.navItemLabel,
          { color: "#fff" },
        ]}
        style={{ backgroundColor: "#000" , marginTop: 10}}
        onPress={() => {
          router.push("/home/settings");
        }}
      />
    </DrawerContentScrollView>
  );
};
export default function HomeLayout() {
  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{headerShown: true}}>
      {/* The screen named "index" refers to app/home/index.tsx */}
      <Drawer.Screen name="tabs" options={{ title: "Home" }} />
      <Drawer.Screen name="settings" options={{ title: "Settings" }} />
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
