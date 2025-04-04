import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSessions } from "../hooks/useSupabase";

interface Stats {
  buyIn: number;
  cashOut: number;
  grossProfit: number;
  netProfit: number;
  sessions: {
    total: number;
    wins: number;
    losses: number;
  };
  hours: {
    total: number;
    rate: number;
  };
}

const StatRow = ({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}) => (
  <View style={styles.statRow}>
    <View style={styles.statLabel}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color="#9B51E0"
          style={styles.statIcon}
        />
      )}
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, color && { color }]}>{value}</Text>
  </View>
);

const OverviewScreen = () => {
  const { sessions, loading, error } = useSessions();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#9B51E0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="chart-box-outline"
          size={48}
          color="#9B51E0"
        />
        <Text style={styles.emptyText}>No sessions recorded yet</Text>
        <Text style={styles.emptySubtext}>
          Add your first session to see statistics
        </Text>
      </View>
    );
  }

  const stats: Stats = sessions.reduce(
    (acc, session) => {
      const profit = session.cash_out - session.buy_in;
      return {
        buyIn: acc.buyIn + session.buy_in,
        cashOut: acc.cashOut + session.cash_out,
        grossProfit: acc.grossProfit + Math.abs(profit),
        netProfit: acc.netProfit + profit,
        sessions: {
          total: acc.sessions.total + 1,
          wins: acc.sessions.wins + (profit > 0 ? 1 : 0),
          losses: acc.sessions.losses + (profit < 0 ? 1 : 0),
        },
        hours: {
          total: acc.hours.total + session.duration,
          rate: acc.hours.rate,
        },
      };
    },
    {
      buyIn: 0,
      cashOut: 0,
      grossProfit: 0,
      netProfit: 0,
      sessions: {
        total: 0,
        wins: 0,
        losses: 0,
      },
      hours: {
        total: 0,
        rate: 0,
      },
    }
  );

  // Calculate hourly rate after total hours is known
  stats.hours.rate =
    stats.hours.total > 0 ? stats.netProfit / stats.hours.total : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
        <Text style={styles.headerSubtitle}>Performance Analytics</Text>
      </View>

      <View style={styles.content}>
        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="finance" size={24} color="#9B51E0" />
            <Text style={styles.sectionTitle}>Summary</Text>
          </View>
          <StatRow
            label="Buy-in"
            value={`$${stats.buyIn.toLocaleString()}`}
            icon="cash"
          />
          <StatRow
            label="Cash Out"
            value={`$${stats.cashOut.toLocaleString()}`}
            icon="cash-multiple"
          />
          <StatRow
            label="Gross Profit"
            value={`$${stats.grossProfit.toLocaleString()}`}
            color="#9B51E0"
            icon="chart-line"
          />
          <StatRow
            label="Net Profit"
            value={`$${stats.netProfit.toLocaleString()}`}
            color={stats.netProfit >= 0 ? "#9B51E0" : "#FF5252"}
            icon="chart-areaspline"
          />
        </Surface>

        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cards-playing-outline"
              size={24}
              color="#9B51E0"
            />
            <Text style={styles.sectionTitle}>Sessions</Text>
          </View>
          <StatRow
            label="Total Sessions"
            value={stats.sessions.total}
            icon="calendar"
          />
          <StatRow
            label="Winning Sessions"
            value={stats.sessions.wins}
            color="#9B51E0"
            icon="trophy-outline"
          />
          <StatRow
            label="Losing Sessions"
            value={stats.sessions.losses}
            color="#FF5252"
            icon="alert"
          />
          <StatRow
            label="Win Rate"
            value={`${(
              (stats.sessions.wins / stats.sessions.total) *
              100
            ).toFixed(1)}%`}
            color="#9B51E0"
            icon="percent"
          />
        </Surface>

        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock" size={24} color="#9B51E0" />
            <Text style={styles.sectionTitle}>Hours</Text>
          </View>
          <StatRow
            label="Total Hours"
            value={stats.hours.total.toFixed(1)}
            icon="clock-outline"
          />
          <StatRow
            label="$/Hour"
            value={`$${stats.hours.rate.toFixed(2)}`}
            color={stats.hours.rate >= 0 ? "#9B51E0" : "#FF5252"}
            icon="cash-100"
          />
        </Surface>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0515",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#0A0515",
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
    color: "#9B51E0",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0515",
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#1A0A2E",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  statLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#FF5252",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    backgroundColor: "#0A0515",
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  emptySubtext: {
    color: "#9B51E0",
    textAlign: "center",
    paddingHorizontal: 32,
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
});

export default OverviewScreen;
