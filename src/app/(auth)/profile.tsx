import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/src/utils/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleFinish = async () => {
    if (!username || !name) {
      Alert.alert('Error', 'Please enter both username and name');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      let publicUrl: string | null = null;
      // Upload new image if selected
      if (avatarUri) {
        console.log('Starting image upload for user:', userId);
        const fileExt = avatarUri.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        
        console.log('File name:', fileName);
        
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(avatarUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('Base64 data length:', base64.length);
        
        // Convert base64 to ArrayBuffer using the decode function
        const arrayBuffer = decode(base64);
        
        console.log('ArrayBuffer size:', arrayBuffer.byteLength);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, arrayBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true
          });
        
        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        
        console.log('Upload successful:', uploadData);
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
        console.log('Public URL:', publicUrl);
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: username.trim(),
          name: name.trim(),
          bio: bio.trim(),
          image: publicUrl || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      console.log('Database update - image URL saved:', publicUrl || '');

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      Alert.alert('Success', 'Profile updated successfully!');
      router.replace('/home/tabs');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', `Failed to save profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Profile</Text>
      {/* Profile Image Section */}
      <View style={styles.imageSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatarUri ? (
            <Image 
              source={{ uri: avatarUri }} 
              style={styles.avatarImage}
              onLoad={() => console.log('Image loaded successfully')}
              onError={(error) => console.log('Image load error:', error)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Tell us about yourself (optional)"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleFinish}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Finish'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  imageSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: 'gray',
    fontSize: 16,
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  input: { width: '100%', height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 12, paddingHorizontal: 10 },
  bioInput: { height: 80, paddingVertical: 10 },
  button: { width: '100%', backgroundColor: '#007bff', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.6 },
  backButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
});
