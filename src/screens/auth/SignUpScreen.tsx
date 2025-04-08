import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // After successful signup, user will need to verify their email
      setError("Please check your email to verify your account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Account
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign up to start tracking your poker sessions
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          outlineColor="#808080"
          activeOutlineColor="#808080"
          textColor="#FFFFFF"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry
          outlineColor="#808080"
          activeOutlineColor="#808080"
          textColor="#FFFFFF"
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry
          outlineColor="#808080"
          activeOutlineColor="#808080"
          textColor="#FFFFFF"
        />

        <Button
          mode="contained"
          onPress={handleSignUp}
          style={styles.button}
          loading={loading}
          disabled={loading}
          buttonColor="#808080"
        >
          Sign Up
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate("SignIn" as never)}
          style={styles.linkButton}
          textColor="#808080"
        >
          Already have an account? Sign In
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: "Dismiss",
          onPress: () => setError(null),
        }}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#808080",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#141414",
  },
  button: {
    marginTop: 16,
  },
  linkButton: {
    marginTop: 16,
  },
  errorSnackbar: {
    backgroundColor: "#2962FF",
  },
});

export default SignUpScreen;
