import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  Text,
  FAB,
  Portal,
  Dialog,
  Button,
  Snackbar,
  Surface,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSessions } from "../hooks/useSupabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SessionsScreen = () => {
  const navigation = useNavigation();
  const { sessions, loading, deleteSession } = useSessions();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    try {
      await deleteSession(selectedSession.id);
      setSnackbarVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setDeleteDialogVisible(false);
      setSelectedSession(null);
    }
  };

  const showDeleteDialog = (session: any) => {
    setSelectedSession(session);
    setDeleteDialogVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#9B51E0" />
      </View>
    );
  }

  const renderSession = ({ item }: { item: any }) => {
    const profit = item.cash_out - item.buy_in;
    const profitColor = profit >= 0 ? "#9B51E0" : "#FF5252";

    return (
      <TouchableOpacity
        onLongPress={() => showDeleteDialog(item)}
        style={styles.sessionContainer}
      >
        <Surface style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.sessionHeader}>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#9B51E0"
                  style={styles.icon}
                />
                <Text style={styles.location}>{item.location}</Text>
              </View>
              <Text style={[styles.profit, { color: profitColor }]}>
                ${profit.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <View style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="cash"
                  size={18}
                  color="#9B51E0"
                  style={styles.icon}
                />
                <Text style={styles.detail}>
                  Buy-in: ${item.buy_in.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={18}
                  color="#9B51E0"
                  style={styles.icon}
                />
                <Text style={styles.detail}>
                  Cash-out: ${item.cash_out.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color="#9B51E0"
                  style={styles.icon}
                />
                <Text style={styles.detail}>Duration: {item.duration}h</Text>
              </View>
            </View>
            {item.notes && (
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={18}
                  color="#9B51E0"
                  style={styles.icon}
                />
                <Text style={styles.notes}>{item.notes}</Text>
              </View>
            )}
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sessions</Text>
        <Text style={styles.headerSubtitle}>Game History</Text>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete Session</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to delete this session? This action cannot
              be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteDialogVisible(false)}
              textColor="#9B51E0"
            >
              Cancel
            </Button>
            <Button onPress={handleDeleteSession} textColor="#FF5252">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.successSnackbar}
      >
        Session deleted successfully
      </Snackbar>

      {error && (
        <Snackbar
          visible={!!error}
          onDismiss={() => setError(null)}
          duration={3000}
          style={styles.errorSnackbar}
        >
          {error}
        </Snackbar>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("AddSession" as never)}
        color="#FFFFFF"
        customSize={56}
      />
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
    borderBottomWidth: 0,
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
  listContent: {
    padding: 20,
    paddingBottom: 120, // Extra padding for FAB
  },
  sessionContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
  },
  cardContent: {
    padding: 20,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  profit: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  sessionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    opacity: 0.8,
  },
  detail: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  notes: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90, // Moved up to avoid nav bar
    backgroundColor: "#9B51E0",
    borderRadius: 28,
  },
  dialog: {
    backgroundColor: "#1A0A2E",
  },
  dialogTitle: {
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  dialogText: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  successSnackbar: {
    backgroundColor: "#1A0A2E",
  },
  errorSnackbar: {
    backgroundColor: "#FF5252",
  },
});

export default SessionsScreen;
