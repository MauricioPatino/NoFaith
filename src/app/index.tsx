// app/index.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";


export default function Index() {
  const { isSignedIn } = useAuth();

  // If somehow the user is already signed in, redirect them.
  if (isSignedIn) {
    return <Redirect href="/home/tabs" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
