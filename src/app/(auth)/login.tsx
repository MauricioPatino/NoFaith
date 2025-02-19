import { Text, View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
export default function LoginScreen() {
  //useWarmUpBrowser();
  
  const { signIn, isLoaded, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });

enum LoginStrategy {
  Google = 'oauthGoogle',
  Apple = 'oauthApple',
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
      const { createdSessionId, setActive } = await selectedAuth();
  
      if (createdSessionId) {
        setActive?.({ session: createdSessionId }); 
        router.replace('/(drawer)/(tabs)/media');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
      router.replace('/(drawer)/(tabs)/media');
    } catch (err: any) {
      console.error(err);
      alert(err.errors?.[0]?.message || "An error occurred");
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
          // onPress={handleSignIn}
          onPress={() => router.replace('/(drawer)/(tabs)/media')}  
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={() => onSelectAuth(LoginStrategy.Google)}>
            <Ionicons name="logo-google" size={24} color="#DB4437" style={styles.btnIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton} onPress={() => onSelectAuth(LoginStrategy.Apple)}>
            <Ionicons name="logo-apple" size={24} color="#000" style={styles.btnIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
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
    backgroundColor: '#fff',
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
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    padding: 10,
  },
  eyeButton: {
    padding: 10,
  },
  btnIcon: {
    paddingRight: 10,
  },
  loginButton: {
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    height: 50,
    borderRadius: 4,
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
    color: '#666',
  },
  signUpText: {
    color: '#4285F4',
    fontWeight: '600',
  },
}); 