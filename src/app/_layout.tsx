import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "../../cache";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, Stack, useRouter } from "expo-router";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error("Missing Publishable Key");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
        <RootLayoutNav />
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  // const { isLoaded, isSignedIn } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (isLoaded && !isSignedIn) {
  //     router.replace('/(auth)/login');
  //   }
  // }, [isLoaded, isSignedIn]);

  // if (!isLoaded && !isSignedIn) {
  //   return null;
  // }

  return (
    <Drawer>
    <Drawer.Screen
      name="/(drawer)/(tabs)"
      options={{
        drawerLabel: "Home",
        title: "",
      }}
    />
    <Drawer.Screen
      name="/(drawer)/(tabs)/(feed)/profile"
      options={{
        drawerLabel: "Shop",
        title: "Shop",
      }}
    />  
    </Drawer>
    /* <Drawer.Screen
      name="settings"
      options={{
        drawerLabel: "Settings",
        title: "Settings",
      }}
    /> */

    // <Stack screenOptions={{ headerShown: false }}>
    //   <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    // </Stack>
  );
}
