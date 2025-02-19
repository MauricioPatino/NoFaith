import { Text, View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { router } from "expo-router";

export default function Register() {
  const { signUp, isLoaded, setActive } = useSignUp();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSignUp = async () => {
    if (!isLoaded) return;
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.create({
        emailAddress: email,
        password,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.replace('/(drawer)/(tabs)/media');
    } catch (err: any) {
      console.error(err);
      if (err.errors?.[0]?.message?.includes("data breach")) {
        alert("This password has been found in a data breach. Please choose a different, unique password to ensure your account's security.");
      } else {
        alert(err.errors?.[0]?.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    if (!/[a-z]/.test(pass)) {
      setPasswordError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/[A-Z]/.test(pass)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(pass)) {
      setPasswordError("Password must contain at least one number");
      return;
    }
    setPasswordError("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NoFaith</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
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
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : (
          <Text style={styles.helperText}>
            Use a unique password that you haven't used on other websites
          </Text>
        )}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputContainer: {
    width: "80%",
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#007bff",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
}); 