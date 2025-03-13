import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const settings = () => {
const { signOut } = useAuth();

  return (
    <View style={styles.text}>
      <Text>Settings screen</Text>
      <Button
        title="Logout"
        onPress={() => {
          signOut();
          router.replace("/"); // Return to the sign-in page
        }}
      />
    </View>
  )
}

export default settings

const styles = StyleSheet.create({
  text: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  }
})