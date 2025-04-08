import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const SettingsScreen = () => {
  const { signOut, session } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Account & Preferences</Text>
      </View>

      <View style={styles.content}>
        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={24} color="#2962FF" />
            <Text style={styles.sectionTitle}>Account Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{session?.user?.email}</Text>
          </View>
        </Surface>

        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="logout" size={24} color="#2962FF" />
            <Text style={styles.sectionTitle}>Account Actions</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.signOutButton}
            buttonColor="#2962FF"
          >
            Sign Out
          </Button>
        </Surface>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#808080",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  signOutButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;
