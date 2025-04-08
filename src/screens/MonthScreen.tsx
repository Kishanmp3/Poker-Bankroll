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
        <ActivityIndicator size="small" color="#808080" />
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
      dotColor: stats.profit >= 0 ? "#2962FF" : "#FF5252",
    };
  });

  // Add selected date marking
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: "#2962FF",
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
            color="#2962FF"
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
                color="#2962FF"
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
                color="#2962FF"
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
                color="#2962FF"
                style={styles.statIcon}
              />
              <Text style={styles.statLabelText}>Profit</Text>
            </View>
            <Text
              style={[
                styles.statValue,
                { color: isProfit ? "#2962FF" : "#FF5252" },
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
                color="#2962FF"
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
              backgroundColor: "#141414",
              calendarBackground: "#141414",
              textSectionTitleColor: "#FFFFFF",
              selectedDayBackgroundColor: "#2962FF",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#2962FF",
              dayTextColor: "#FFFFFF",
              textDisabledColor: "rgba(255, 255, 255, 0.4)",
              dotColor: "#2962FF",
              selectedDotColor: "#FFFFFF",
              arrowColor: "#2962FF",
              monthTextColor: "#FFFFFF",
              indicatorColor: "#2962FF",
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  calendarCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
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
  },
  statIcon: {
    marginRight: 8,
  },
  statLabelText: {
    fontSize: 14,
    color: "#808080",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
});

export default MonthScreen;
