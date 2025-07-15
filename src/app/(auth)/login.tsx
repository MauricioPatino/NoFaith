import { Text, View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useSignIn, useOAuth, useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { supabase } from "@/src/utils/supabase";

export default function LoginScreen() {
  
  const { signIn, isLoaded, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { startSSOFlow: googleAuth } = useSSO();
  const { startSSOFlow: appleAuth } = useSSO();

enum LoginStrategy {
  Google = 'oauth_google',
  Apple = 'oauth_apple',
}

  const AUTH_STRATEGIES = {
    [LoginStrategy.Google]: googleAuth,
    [LoginStrategy.Apple]: appleAuth,
  };

  const onSelectAuth = async (strategy: LoginStrategy) => {
    const selectedAuth = AUTH_STRATEGIES[strategy];
  
    if (!selectedAuth) {
      console.error(`Invalid strategy: ${strategy}`);
      return;
    }
  
    try {
      const { createdSessionId, setActive } = await selectedAuth({ strategy: strategy });
  
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace('/home/tabs');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };
  

  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user has completed profile setup
        const { data: userProfile } = await supabase
          .from('users')
          .select('username, name')
          .eq('id', data.user.id)
          .single();

        if (userProfile && userProfile.username && userProfile.name) {
          // Profile is complete, go to main app
          router.replace('/home/tabs');
        } else {
          // Profile incomplete, go to profile setup
          router.replace('/(auth)/profile');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NoFaith</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Signing in..." : "Log in"}
          </Text>
        </TouchableOpacity>

        {/* <Text style={styles.orText}>or</Text>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={() => onSelectAuth(LoginStrategy.Google)}>
            <Ionicons name="logo-google" size={24} color="#DB4437" style={styles.btnIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton} onPress={() => onSelectAuth(LoginStrategy.Apple)}>
            <Ionicons name="logo-apple" size={24} color="#000" style={styles.btnIcon} />
          </TouchableOpacity>
        </View> */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light grey background
    padding: 20,
  },
  header: {
    marginTop: 80,
    marginBottom: 140,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#B8860B', // Darker gold color for title
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: '#B8860B', // Darker gold border
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF', // White background for inputs
    color: '#000000', // Black text
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#B8860B', // Darker gold border
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FFFFFF', // White background
  },
  passwordInput: {
    flex: 1,
    height: 50,
    padding: 16,
    color: '#000000', // Black text
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
  },
  btnIcon: {
    paddingRight: 10,
  },
  loginButton: {
    height: 50,
    backgroundColor: '#B8860B', // Darker gold background
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFFFFF', // White text on darker gold button
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#B8860B', // Darker gold text
    marginVertical: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 2,
    borderColor: '#B8860B', // Darker gold border
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666666', // Dark gray text
  },
  signUpText: {
    color: '#B8860B', // Darker gold color for sign up link
    fontWeight: '600',
  },
}); 