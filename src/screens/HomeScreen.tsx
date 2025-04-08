import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Text, Surface, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSessions } from "../hooks/useSupabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
  VictoryScatter,
  VictoryVoronoiContainer,
  VictoryTooltip,
  VictoryArea,
  VictoryBar,
  VictoryGroup,
  VictoryPie,
  VictoryLabel,
  VictoryCandlestick,
} from "victory-native";

const { width, height } = Dimensions.get("window");
const CARD_MARGIN = 12;
const LEFT_CARD_WIDTH = (width - 40 - CARD_MARGIN) * 0.48; // 48% of available width
const RIGHT_CARD_WIDTH = (width - 40 - CARD_MARGIN) * 0.48; // 48% of available width
const CARD_HEIGHT = 110; // Increased height for left cards
const ACCENT_COLOR = "#2962FF";
const NEGATIVE_COLOR = "#FF5252"; // Define negative color

interface SessionStats {
  netProfit: number;
  totalSessions: number;
  wins: number;
  totalHours: number;
  bestSession: number | null;
  worstSession: number | null;
  bestHourly: number | null;
  totalBuyIn: number;
  currentStreak: number;
  bestStreak: number;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { sessions, loading, error } = useSessions();

  // Prepare data for candlestick chart - Use index for X
  const candlestickData = React.useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    return sessions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Still sort by date first
      .map((session, index) => {
        // Add index here
        const profit = session.cash_out - session.buy_in;
        return {
          x: index + 1, // Use index (1-based) for x-axis
          open: 0,
          close: profit,
          high: profit > 0 ? profit : 0,
          low: profit < 0 ? profit : 0,
          // Keep original date for tooltip if needed, or just use index
          // originalDate: new Date(session.date)
        };
      });
  }, [sessions]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#808080" />
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

  // Calculate additional statistics
  const stats = sessions.reduce<SessionStats>(
    (acc, session, index, array) => {
      const profit = session.cash_out - session.buy_in;
      const hourlyRate = profit / session.duration;

      // Calculate streaks
      const isWin = profit > 0;
      let currentStreak = isWin ? acc.currentStreak + 1 : 0;

      // For best streak, we need to look at the sequence
      const bestStreak = isWin
        ? Math.max(acc.bestStreak, currentStreak)
        : acc.bestStreak;

      return {
        netProfit: acc.netProfit + profit,
        totalSessions: acc.totalSessions + 1,
        wins: acc.wins + (profit > 0 ? 1 : 0),
        totalHours: acc.totalHours + session.duration,
        bestSession:
          profit > (acc.bestSession ?? -Infinity) ? profit : acc.bestSession,
        worstSession:
          profit < (acc.worstSession ?? Infinity) ? profit : acc.worstSession,
        bestHourly:
          hourlyRate > (acc.bestHourly ?? -Infinity)
            ? hourlyRate
            : acc.bestHourly,
        totalBuyIn: acc.totalBuyIn + session.buy_in,
        currentStreak,
        bestStreak,
      };
    },
    {
      netProfit: 0,
      totalSessions: 0,
      wins: 0,
      totalHours: 0,
      bestSession: null,
      worstSession: null,
      bestHourly: null,
      totalBuyIn: 0,
      currentStreak: 0,
      bestStreak: 0,
    }
  );

  const winRate = ((stats.wins / stats.totalSessions) * 100).toFixed(0);
  const avgHourlyRate = (stats.netProfit / stats.totalHours).toFixed(2);
  const roi = ((stats.netProfit / stats.totalBuyIn) * 100).toFixed(1);

  // Prepare data for line chart
  const chartData = sessions
    .map((session) => {
      const profit = session.cash_out - session.buy_in;
      return {
        x: new Date(session.date).getTime(),
        y: profit,
        profit: profit,
      };
    })
    .sort((a, b) => a.x - b.x);

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#1A0A2E", "#0A0515"]}
          style={styles.emptyContainer}
        >
          <Text variant="headlineLarge" style={styles.emptyTitle}>
            Welcome to Bankroll
          </Text>
          <Text variant="bodyLarge" style={styles.emptySubtitle}>
            Start tracking your poker journey
          </Text>
          <IconButton
            icon="plus"
            mode="contained"
            size={32}
            iconColor="#FFFFFF"
            containerColor="#9B51E0"
            style={styles.addButton}
            onPress={() => navigation.navigate("AddSession" as never)}
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.subtitle}>Track your progress</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings" as never)}
          >
            <MaterialCommunityIcons name="cog" size={24} color={ACCENT_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Main Profit Card */}
        <Surface style={styles.mainCard}>
          <LinearGradient
            colors={["#141414", "#1A1A1A"]}
            style={styles.mainCardGradient}
          >
            <View style={styles.mainCardHeader}>
              <View>
                <Text style={styles.mainCardTitle}>Total Profit</Text>
                <Text
                  style={[
                    styles.mainCardValue,
                    { color: stats.netProfit >= 0 ? ACCENT_COLOR : "#FF5252" },
                  ]}
                >
                  ${stats.netProfit.toLocaleString()}
                </Text>
              </View>
              <View
                style={[
                  styles.profitBadge,
                  {
                    backgroundColor:
                      stats.netProfit >= 0 ? `${ACCENT_COLOR}20` : "#FF525220",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={stats.netProfit >= 0 ? "trending-up" : "trending-down"}
                  size={24}
                  color={stats.netProfit >= 0 ? ACCENT_COLOR : "#FF5252"}
                />
              </View>
            </View>
          </LinearGradient>
        </Surface>

        {/* Stats Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.leftColumn}>
            <View style={styles.leftRow}>
              <Surface style={styles.leftCard}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={20}
                  color={ACCENT_COLOR}
                />
                <Text style={styles.gridCardTitle}>Win Rate</Text>
                <Text style={styles.gridCardValue}>{winRate}%</Text>
              </Surface>

              <Surface style={styles.leftCard}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color={ACCENT_COLOR}
                />
                <Text style={styles.gridCardTitle}>Per Hour</Text>
                <Text style={styles.gridCardValue}>${avgHourlyRate}</Text>
              </Surface>
            </View>

            <View style={styles.leftRow}>
              <Surface style={styles.leftCard}>
                <MaterialCommunityIcons
                  name="clock"
                  size={20}
                  color={ACCENT_COLOR}
                />
                <Text style={styles.gridCardTitle}>Hours</Text>
                <Text style={styles.gridCardValue}>{stats.totalHours}h</Text>
              </Surface>

              <Surface style={styles.leftCard}>
                <MaterialCommunityIcons
                  name="cards"
                  size={20}
                  color={ACCENT_COLOR}
                />
                <Text style={styles.gridCardTitle}>Sessions</Text>
                <Text style={styles.gridCardValue}>{stats.totalSessions}</Text>
              </Surface>
            </View>
          </View>

          <Surface style={styles.rightCard}>
            <View style={styles.rightCardHeader}>
              <MaterialCommunityIcons
                name="chart-pie"
                size={20}
                color={ACCENT_COLOR}
              />
              <Text style={styles.gridCardTitle}>Session Outcomes</Text>
            </View>
            <View style={styles.chartWrapper}>
              <View style={styles.pieContainer}>
                <VictoryPie
                  width={RIGHT_CARD_WIDTH - 48}
                  height={RIGHT_CARD_WIDTH - 48}
                  padding={0}
                  innerRadius={RIGHT_CARD_WIDTH / 3.8}
                  radius={RIGHT_CARD_WIDTH / 3}
                  data={[
                    { x: "Wins", y: stats.wins },
                    { x: "Losses", y: stats.totalSessions - stats.wins },
                  ]}
                  colorScale={[ACCENT_COLOR, "#4A4A4A"]}
                  style={{
                    labels: { fill: "none" },
                    data: {
                      fillOpacity: 0.9,
                    },
                  }}
                />
                <View style={styles.pieCenter}>
                  <Text style={styles.pieValue}>{winRate}%</Text>
                  <Text style={styles.pieLabel}>Win Rate</Text>
                </View>
              </View>
              <View style={styles.pieLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: ACCENT_COLOR },
                    ]}
                  />
                  <Text style={styles.legendText}>Wins ({stats.wins})</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#4A4A4A" }]}
                  />
                  <Text style={styles.legendText}>
                    Losses ({stats.totalSessions - stats.wins})
                  </Text>
                </View>
              </View>
            </View>
          </Surface>
        </View>

        {/* Profit Trend Graph -> Candlestick Chart */}
        <View style={styles.chartWrapper}>
          {candlestickData.length > 0 ? (
            <VictoryChart
              width={width - 40}
              height={200}
              padding={{ top: 20, bottom: 30, left: 50, right: 30 }} // Adjusted bottom padding
              containerComponent={
                <VictoryVoronoiContainer
                  voronoiDimension="x"
                  labels={
                    ({ datum }) =>
                      `Session ${
                        datum.x
                      }\nProfit: $${datum.close.toLocaleString()}` // Updated tooltip label
                  }
                  labelComponent={
                    <VictoryTooltip
                      cornerRadius={5}
                      flyoutStyle={{
                        fill: "#333333",
                        stroke: "#555555",
                        strokeWidth: 1,
                      }}
                      style={{ fill: "#FFFFFF", fontSize: 12 }}
                    />
                  }
                />
              }
            >
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: "#4A4A4A" },
                  tickLabels: { fill: "#808080", fontSize: 10 },
                  grid: { stroke: "#2A2A2A", strokeDasharray: "4, 4" },
                }}
                tickFormat={(t) => `$${t / 1000}k`}
              />
              <VictoryAxis
                style={{
                  axis: { stroke: "#4A4A4A" },
                  tickLabels: { fill: "transparent" }, // Hide x-axis tick labels
                  grid: { stroke: "transparent" }, // Hide x-axis grid lines for cleaner look
                }}
              />
              <VictoryCandlestick
                data={candlestickData}
                candleColors={{
                  positive: ACCENT_COLOR,
                  negative: NEGATIVE_COLOR,
                }}
                style={{
                  data: {
                    strokeWidth: 1,
                  },
                }}
                candleRatio={0.8}
              />
            </VictoryChart>
          ) : (
            <View style={styles.emptyChartContainer}>
              <Text style={styles.emptyChartText}>No session data yet</Text>
            </View>
          )}
        </View>

        {/* Session Streak Card */}
        <Surface style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <MaterialCommunityIcons
              name="fire"
              size={24}
              color={ACCENT_COLOR}
            />
            <Text style={styles.streakTitle}>Current Streak</Text>
          </View>
          <Text style={styles.streakValue}>{stats.currentStreak} Sessions</Text>
          <Text style={styles.streakSubtitle}>
            Best: {stats.bestStreak} Sessions
          </Text>
        </Surface>

        {/* Quick Stats */}
        <Surface style={styles.quickStatsCard}>
          <Text style={styles.quickStatsTitle}>Quick Stats</Text>
          <View style={styles.quickStatRow}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Best Session</Text>
              <Text style={[styles.quickStatValue, { color: ACCENT_COLOR }]}>
                ${stats.bestSession?.toLocaleString() ?? 0}
              </Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>Worst Session</Text>
              <Text style={[styles.quickStatValue, { color: "#4A4A4A" }]}>
                ${Math.abs(stats.worstSession ?? 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </Surface>
      </View>
    </ScrollView>
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#808080",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  mainCardGradient: {
    padding: 20,
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainCardTitle: {
    fontSize: 16,
    color: "#808080",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  mainCardValue: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  profitBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    height: CARD_HEIGHT * 2 + CARD_MARGIN,
  },
  leftColumn: {
    width: LEFT_CARD_WIDTH,
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 12,
    width: (LEFT_CARD_WIDTH - CARD_MARGIN) / 2,
    height: CARD_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  rightCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    width: RIGHT_CARD_WIDTH,
    height: CARD_HEIGHT * 2 + CARD_MARGIN,
  },
  rightCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    justifyContent: "center",
  },
  chartWrapper: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  pieContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: RIGHT_CARD_WIDTH - 48,
  },
  pieCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pieValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  pieLabel: {
    fontSize: 13,
    color: "#808080",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  pieLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 13,
    color: "#808080",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  gridCardTitle: {
    fontSize: 12,
    color: "#808080",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  gridCardValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  streakCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  streakSubtitle: {
    fontSize: 14,
    color: "#808080",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  quickStatsCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
  },
  quickStatsTitle: {
    fontSize: 16,
    color: "#808080",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  quickStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickStat: {
    alignItems: "flex-start",
  },
  quickStatLabel: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  errorText: {
    color: "#808080",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    color: "#808080",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  addButton: {
    marginTop: 16,
  },
  emptyChartContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    color: "#808080",
    fontSize: 14,
  },
});

export default HomeScreen;
