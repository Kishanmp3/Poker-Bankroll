import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, Surface, useTheme } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useSessions } from "../hooks/useSupabase";
import {
  RootStackParamList,
  MainTabParamList,
  AuthStackParamList,
} from "./types";
import { useAuth } from "../context/AuthContext";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import OverviewScreen from "../screens/OverviewScreen";
import SessionsScreen from "../screens/SessionsScreen";
import MonthScreen from "../screens/MonthScreen";
import StakingScreen from "../screens/StakingScreen";
import AddSessionScreen from "../screens/AddSessionScreen";
import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const HomeHeader = () => {
  const { sessions } = useSessions();
  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Surface style={styles.headerContainer}>
      <LinearGradient
        colors={["rgba(33, 150, 243, 0.15)", "transparent"]}
        style={styles.headerGradient}
      >
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {timeOfDay()}
        </Text>
        <Text variant="bodyLarge" style={styles.headerDescription}>
          Ready to hit the tables?
        </Text>
      </LinearGradient>
    </Surface>
  );
};

const OverviewHeader = () => {
  return (
    <Surface style={styles.headerContainer}>
      <LinearGradient
        colors={["rgba(33, 150, 243, 0.1)", "transparent"]}
        style={styles.headerGradient}
      >
        <Text variant="titleMedium" style={styles.headerSubtitle}>
          Performance Analytics
        </Text>
        <Text variant="bodyLarge" style={styles.headerDescription}>
          Track your progress over time
        </Text>
      </LinearGradient>
    </Surface>
  );
};

const SessionsHeader = () => {
  const { sessions } = useSessions();

  return (
    <Surface style={styles.headerContainer}>
      <LinearGradient
        colors={["rgba(41, 98, 255, 0.1)", "transparent"]}
        style={styles.headerGradient}
      >
        <Text variant="titleMedium" style={styles.headerSubtitle}>
          Session History
        </Text>
        <Text variant="bodyLarge" style={styles.headerDescription}>
          {sessions.length} {sessions.length === 1 ? "session" : "sessions"}{" "}
          recorded
        </Text>
      </LinearGradient>
    </Surface>
  );
};

const MonthHeader = () => {
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <Surface style={styles.headerContainer}>
      <LinearGradient
        colors={["rgba(33, 150, 243, 0.1)", "transparent"]}
        style={styles.headerGradient}
      >
        <Text variant="titleMedium" style={styles.headerSubtitle}>
          Monthly View
        </Text>
        <Text variant="bodyLarge" style={styles.headerDescription}>
          {currentMonth}
        </Text>
      </LinearGradient>
    </Surface>
  );
};

const StakingHeader = () => {
  return (
    <Surface style={styles.headerContainer}>
      <LinearGradient
        colors={["rgba(33, 150, 243, 0.1)", "transparent"]}
        style={styles.headerGradient}
      >
        <Text variant="titleMedium" style={styles.headerSubtitle}>
          Staking Arrangements
        </Text>
        <Text variant="bodyLarge" style={styles.headerDescription}>
          Manage your backing deals
        </Text>
      </LinearGradient>
    </Surface>
  );
};

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#141414",
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        },
        tabBarActiveTintColor: "#2962FF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cards" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Month"
        component={MonthScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-month"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Staking"
        component={StakingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigation = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {session ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="AddSession"
              component={AddSessionScreen}
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  headerContainer: {
    backgroundColor: "#141414",
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  headerDescription: {
    color: "#808080",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
});

export default MainNavigation;
