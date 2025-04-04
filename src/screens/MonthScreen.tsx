import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Text, Card, ActivityIndicator, Surface } from "react-native-paper";
import { Calendar, DateData } from "react-native-calendars";
import { useSessions } from "../hooks/useSupabase";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DayStats {
  profit: number;
  buyIn: number;
  cashOut: number;
  duration: number;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const MonthScreen = () => {
  const navigation = useNavigation();
  const { sessions, loading } = useSessions();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#9B51E0" />
      </View>
    );
  }

  // Group sessions by date
  const sessionsByDate = sessions.reduce(
    (acc: { [date: string]: DayStats }, session) => {
      const date = session.date.split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          profit: 0,
          buyIn: 0,
          cashOut: 0,
          duration: 0,
        };
      }
      acc[date].buyIn += session.buy_in;
      acc[date].cashOut += session.cash_out;
      acc[date].profit += session.cash_out - session.buy_in;
      acc[date].duration += session.duration;
      return acc;
    },
    {}
  );

  // Prepare marked dates for calendar
  const markedDates: MarkedDates = {};
  Object.entries(sessionsByDate).forEach(([date, stats]) => {
    markedDates[date] = {
      marked: true,
      dotColor: stats.profit >= 0 ? "#9B51E0" : "#FF5252",
    };
  });

  // Add selected date marking
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: "#9B51E0",
    };
  }

  const renderDayStats = () => {
    if (!selectedDate || !sessionsByDate[selectedDate]) return null;

    const stats = sessionsByDate[selectedDate];
    const isProfit = stats.profit >= 0;

    return (
      <Surface style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={24}
            color="#9B51E0"
          />
          <Text style={styles.statsTitle}>
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statLabel}>
              <MaterialCommunityIcons
                name="cash"
                size={20}
                color="#9B51E0"
                style={styles.statIcon}
              />
              <Text style={styles.statLabelText}>Buy-in</Text>
            </View>
            <Text style={styles.statValue}>
              ${stats.buyIn.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statLabel}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={20}
                color="#9B51E0"
                style={styles.statIcon}
              />
              <Text style={styles.statLabelText}>Cash-out</Text>
            </View>
            <Text style={styles.statValue}>
              ${stats.cashOut.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statLabel}>
              <MaterialCommunityIcons
                name="chart-line"
                size={20}
                color="#9B51E0"
                style={styles.statIcon}
              />
              <Text style={styles.statLabelText}>Profit</Text>
            </View>
            <Text
              style={[
                styles.statValue,
                { color: isProfit ? "#9B51E0" : "#FF5252" },
              ]}
            >
              ${stats.profit.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statLabel}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#9B51E0"
                style={styles.statIcon}
              />
              <Text style={styles.statLabelText}>Duration</Text>
            </View>
            <Text style={styles.statValue}>{stats.duration}h</Text>
          </View>
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly View</Text>
        <Text style={styles.headerSubtitle}>Session Calendar</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Surface style={styles.calendarCard}>
          <Calendar
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#1A0A2E",
              calendarBackground: "#1A0A2E",
              textSectionTitleColor: "#FFFFFF",
              selectedDayBackgroundColor: "#9B51E0",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#9B51E0",
              dayTextColor: "#FFFFFF",
              textDisabledColor: "rgba(255, 255, 255, 0.4)",
              dotColor: "#9B51E0",
              selectedDotColor: "#FFFFFF",
              arrowColor: "#9B51E0",
              monthTextColor: "#FFFFFF",
              textMonthFontWeight: "bold",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
              textMonthFontFamily:
                Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
              textDayFontFamily:
                Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
              textDayHeaderFontFamily:
                Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
            }}
          />
        </Surface>
        {renderDayStats()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0515",
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0515",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  calendarCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1A0A2E",
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 20,
    backgroundColor: "#1A0A2E",
    padding: 20,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  statIcon: {
    opacity: 0.8,
  },
  statLabelText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
});

export default MonthScreen;
