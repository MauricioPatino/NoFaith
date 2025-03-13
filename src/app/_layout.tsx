import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "../../cache";
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Redirect, Slot, Stack, useRouter, useSegments } from "expo-router";


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const DrawerStack = createDrawerNavigator();

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SignedIn>
        <Redirect href="/home/tabs" />
      </SignedIn>
      <SignedOut>
        <Stack screenOptions ={{headerShown: false}} />
      </SignedOut>
    </ClerkProvider>
  );
};

export default RootLayout;

