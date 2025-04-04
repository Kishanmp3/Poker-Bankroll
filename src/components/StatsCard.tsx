import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  color = "#ffffff",
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={[styles.title, { color }]}>
          {title}
        </Text>
        <Text variant="headlineMedium" style={[styles.value, { color }]}>
          {value}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a2634",
    marginVertical: 4,
    marginHorizontal: 8,
    flex: 1,
  },
  title: {
    color: "#8899aa",
    marginBottom: 4,
  },
  value: {
    fontWeight: "bold",
  },
  subtitle: {
    color: "#8899aa",
    marginTop: 4,
  },
});

export default StatsCard;
