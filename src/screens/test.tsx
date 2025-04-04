import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { ActivityIndicator } from "react-native";

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Testing ActivityIndicator with numeric size</Text>
      <ActivityIndicator size="small" color="#2196F3" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121920",
  },
});

export default TestScreen;
