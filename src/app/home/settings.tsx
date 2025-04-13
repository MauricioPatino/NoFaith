// app/settings.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Optionally update your app's theme or persist the setting to your backend
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      {/* Account Settings */}
      <TouchableOpacity style={styles.item} onPress={() => router.push('/')}>
        <Text style={styles.itemText}>Account Settings</Text>
      </TouchableOpacity>

      {/* Notification Settings */}
      <TouchableOpacity style={styles.item} onPress={() => router.push('/')}>
        <Text style={styles.itemText}>Notification Settings</Text>
      </TouchableOpacity>

      {/* Appearance Settings */}
      <View style={[styles.item, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={styles.itemText}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      {/* About & Help */}
      <TouchableOpacity style={styles.item} onPress={() => router.push('/')}>
        <Text style={styles.itemText}>About & Help</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.item, styles.logoutItem]} 
        onPress={async () => {
          await signOut();
          router.replace('/'); // Redirect to login or landing page
        }}
      >
        <Text style={[styles.itemText, { color: 'red' }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
  },
  logoutItem: {
    marginTop: 20,
  },
});
