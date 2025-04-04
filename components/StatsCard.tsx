import React from "react";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Card, Text } from "react-native-paper";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

interface Styles {
  card: ViewStyle;
  title: TextStyle;
  value: TextStyle;
  subtitle: TextStyle;
}

const StatsCard = ({
  title,
  value,
  subtitle,
  color = "#ffffff",
}: StatsCardProps) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create<Styles>({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#1a2634",
  },
  title: {
    color: "#8899aa",
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#8899aa",
    fontSize: 12,
  },
});

export default StatsCard;
