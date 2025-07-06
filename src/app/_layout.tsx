import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "../../cache";
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Redirect, Slot, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Linking } from "react-native";
import { router } from 'expo-router';
import { supabase } from '@/src/utils/supabase';


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const DrawerStack = createDrawerNavigator();

const RootLayout = () => {
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('verify-email')) {
        // Extract token from URL
        const token = url.split('token=')[1];
        
        // Verify the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (!error) {
          // Email verified successfully - navigate to home
          router.replace('/home/tabs');
        } else {
          // Verification failed
          console.error('Verification failed:', error);
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, []);
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

