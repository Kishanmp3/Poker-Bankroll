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
} from "victory-native";

const { width } = Dimensions.get("window");

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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
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
            <MaterialCommunityIcons name="cog" size={24} color="#9B51E0" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Surface style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Profit Timeline</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#9B51E0" }]}
                />
                <Text style={styles.legendText}>Profit</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#FF5252" }]}
                />
                <Text style={styles.legendText}>Loss</Text>
              </View>
            </View>
          </View>

          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{ x: 25 }}
            padding={{ top: 40, bottom: 40, left: 50, right: 20 }}
            width={width - 40}
            height={280}
            containerComponent={
              <VictoryVoronoiContainer
                labels={({ datum }) => `$${datum.y}`}
                labelComponent={
                  <VictoryTooltip
                    style={{ fill: "#FFFFFF" }}
                    flyoutStyle={{
                      fill: "#1A0A2E",
                      stroke: "#9B51E0",
                      strokeWidth: 1,
                    }}
                  />
                }
              />
            }
          >
            <VictoryAxis
              style={{
                axis: { stroke: "#FFFFFF20" },
                tickLabels: { fill: "#FFFFFF60", fontSize: 10 },
                grid: { stroke: "#FFFFFF10", strokeDasharray: "4" },
              }}
              tickFormat={(date: number) =>
                new Date(date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#FFFFFF20" },
                tickLabels: { fill: "#FFFFFF60", fontSize: 10 },
                grid: { stroke: "#FFFFFF10", strokeDasharray: "4" },
              }}
              tickFormat={(tick: number) => `$${tick}`}
            />
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: "#1F0F3C",
                  stroke: "#9B51E0",
                  strokeWidth: 2,
                  fillOpacity: 0.2,
                },
              }}
            />
            <VictoryScatter
              data={chartData}
              size={6}
              style={{
                data: {
                  fill: (args: any) =>
                    args.datum.profit >= 0 ? "#9B51E0" : "#FF5252",
                  stroke: "#FFFFFF",
                  strokeWidth: 1,
                },
              }}
            />
          </VictoryChart>

          <View style={styles.chartStats}>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>30-Day Trend</Text>
              <Text
                style={[
                  styles.chartStatValue,
                  { color: stats.netProfit >= 0 ? "#9B51E0" : "#FF5252" },
                ]}
              >
                {stats.netProfit >= 0 ? "↗ Upward" : "↘ Downward"}
              </Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Best Day</Text>
              <Text style={styles.chartStatValue}>Thu</Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Consistency</Text>
              <Text style={styles.chartStatValue}>{winRate}%</Text>
            </View>
          </View>
        </Surface>

        <Surface style={styles.mainCard}>
          <Text variant="headlineLarge" style={styles.profitText}>
            ${stats.netProfit.toLocaleString()}
          </Text>
          <Text variant="bodyMedium" style={styles.profitLabel}>
            Lifetime Earnings
          </Text>
          <LinearGradient
            colors={[
              stats.netProfit >= 0 ? "#9B51E020" : "#FF525220",
              "transparent",
            ]}
            style={styles.profitIndicator}
          />
        </Surface>

        <View style={styles.metricsGrid}>
          <Surface style={styles.metricCard}>
            <MaterialCommunityIcons
              name="trophy"
              size={20}
              color="#9B51E0"
              style={styles.metricIcon}
            />
            <Text style={styles.metricValue}>{winRate}%</Text>
            <Text style={styles.metricLabel}>Win Rate</Text>
          </Surface>

          <Surface style={styles.metricCard}>
            <MaterialCommunityIcons
              name="clock"
              size={20}
              color="#9B51E0"
              style={styles.metricIcon}
            />
            <Text style={styles.metricValue}>${avgHourlyRate}</Text>
            <Text style={styles.metricLabel}>Per Hour</Text>
          </Surface>

          <Surface style={styles.metricCard}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={20}
              color="#9B51E0"
              style={styles.metricIcon}
            />
            <Text style={styles.metricValue}>{roi}%</Text>
            <Text style={styles.metricLabel}>ROI</Text>
          </Surface>

          <Surface style={styles.metricCard}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={20}
              color="#9B51E0"
              style={styles.metricIcon}
            />
            <Text style={styles.metricValue}>{stats.totalSessions}</Text>
            <Text style={styles.metricLabel}>Sessions</Text>
          </Surface>
        </View>

        <View style={styles.quickStatsSection}>
          <Surface style={styles.quickStatCard}>
            <View style={styles.quickStatHeader}>
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={24}
                color="#9B51E0"
              />
              <Text style={styles.quickStatTitle}>Session Analysis</Text>
            </View>

            <View style={styles.quickStatGrid}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>
                  ${(stats.bestSession ?? 0).toLocaleString()}
                </Text>
                <Text style={styles.quickStatLabel}>Biggest Win</Text>
              </View>

              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>
                  ${Math.abs(stats.worstSession ?? 0).toLocaleString()}
                </Text>
                <Text style={styles.quickStatLabel}>Biggest Loss</Text>
              </View>

              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>
                  ${(stats.totalBuyIn / stats.totalSessions).toFixed(0)}
                </Text>
                <Text style={styles.quickStatLabel}>Avg Buy-in</Text>
              </View>

              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>
                  {(stats.totalHours / stats.totalSessions).toFixed(1)}h
                </Text>
                <Text style={styles.quickStatLabel}>Avg Duration</Text>
              </View>
            </View>

            <View style={styles.quickStatHighlight}>
              <View style={styles.highlightRow}>
                <MaterialCommunityIcons
                  name="clock-check-outline"
                  size={20}
                  color="#9B51E0"
                />
                <Text style={styles.highlightText}>
                  Best time to play: Evening sessions
                </Text>
              </View>
              <View style={styles.highlightRow}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={20}
                  color="#9B51E0"
                />
                <Text style={styles.highlightText}>
                  {stats.netProfit > 0
                    ? `You're averaging $${(
                        stats.netProfit / stats.totalSessions
                      ).toFixed(0)} per session`
                    : "Focus on longer sessions for better results"}
                </Text>
              </View>
            </View>
          </Surface>
        </View>

        <Surface style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Quick Stats</Text>

          <View style={styles.insightRow}>
            <View style={styles.insightItem}>
              <MaterialCommunityIcons
                name="trending-up"
                size={20}
                color="#9B51E0"
              />
              <Text style={styles.insightValue}>
                ${(stats.netProfit / stats.totalSessions).toFixed(0)}
              </Text>
              <Text style={styles.insightLabel}>Avg. per Session</Text>
            </View>

            <View style={styles.insightItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#9B51E0"
              />
              <Text style={styles.insightValue}>
                {(stats.totalHours / stats.totalSessions).toFixed(1)}h
              </Text>
              <Text style={styles.insightLabel}>Avg. Session Length</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightRow}>
            <View style={styles.insightItem}>
              <MaterialCommunityIcons
                name="cash-plus"
                size={20}
                color="#9B51E0"
              />
              <Text style={styles.insightValue}>
                ${(stats.totalBuyIn / stats.totalSessions).toFixed(0)}
              </Text>
              <Text style={styles.insightLabel}>Avg. Buy-in</Text>
            </View>

            <View style={styles.insightItem}>
              <MaterialCommunityIcons
                name="calendar-range"
                size={20}
                color="#9B51E0"
              />
              <Text style={styles.insightValue}>
                {Math.ceil(stats.totalHours / (24 * 30))}mo
              </Text>
              <Text style={styles.insightLabel}>Time Playing</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightHighlight}>
            <MaterialCommunityIcons
              name={
                stats.netProfit > 0
                  ? "chart-line-variant"
                  : "chart-timeline-variant"
              }
              size={20}
              color={stats.netProfit > 0 ? "#9B51E0" : "#FF5252"}
            />
            <Text style={styles.insightHighlightText}>
              {stats.netProfit > 0
                ? `You're up ${(
                    (stats.netProfit / stats.totalBuyIn) *
                    100
                  ).toFixed(0)}% on your total investment`
                : "Keep grinding! Your next session could turn it around"}
            </Text>
          </View>
        </Surface>

        <View style={styles.detailedStats}>
          <Surface style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Best Session</Text>
              <Text style={[styles.detailValue, { color: "#9B51E0" }]}>
                ${stats.bestSession?.toLocaleString() ?? 0}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Worst Session</Text>
              <Text style={[styles.detailValue, { color: "#FF5252" }]}>
                ${stats.worstSession?.toLocaleString() ?? 0}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Best Hourly</Text>
              <Text style={[styles.detailValue, { color: "#9B51E0" }]}>
                ${stats.bestHourly?.toFixed(2) ?? 0}/h
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Hours</Text>
              <Text style={styles.detailValue}>{stats.totalHours}h</Text>
            </View>
          </Surface>
        </View>
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
    paddingBottom: 100, // Add padding for the floating navigation bar
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0515",
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  mainCard: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  profitText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  profitLabel: {
    color: "#9B51E0",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  profitIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  chartCard: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  chartLegend: {
    flexDirection: "row",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#FFFFFF80",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
  },
  chartStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF10",
  },
  chartStat: {
    alignItems: "center",
  },
  chartStatLabel: {
    fontSize: 12,
    color: "#FFFFFF80",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  chartStatValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 16,
    alignItems: "center",
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  metricLabel: {
    fontSize: 14,
    color: "#9B51E0",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  detailedStats: {
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#FFFFFF80",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#0A0515",
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
    color: "#9B51E0",
    opacity: 0.8,
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
    color: "#9B51E0",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  addButton: {
    marginTop: 16,
  },
  errorText: {
    color: "#FF5252",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A0A2E",
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  streakInfo: {
    alignItems: "flex-start",
  },
  streakCount: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  streakLabel: {
    color: "#9B51E0",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  insightsCard: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  insightItem: {
    alignItems: "center",
    flex: 1,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  insightLabel: {
    fontSize: 12,
    color: "#9B51E0",
    opacity: 0.8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#FFFFFF10",
    marginVertical: 16,
  },
  insightHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF08",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  insightHighlightText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  quickStatsSection: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  quickStatCard: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
    padding: 20,
  },
  quickStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  quickStatTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  quickStatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  quickStatItem: {
    width: "45%",
    backgroundColor: "#FFFFFF08",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  quickStatLabel: {
    fontSize: 14,
    color: "#9B51E0",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  quickStatHighlight: {
    marginTop: 20,
    backgroundColor: "#FFFFFF08",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A0A2E",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
