import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  Text,
  Button,
  TextInput,
  Portal,
  Modal,
  FAB,
  Dialog,
  Snackbar,
  Surface,
} from "react-native-paper";
import { useStakingArrangements } from "../hooks/useSupabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StakingArrangement {
  id: string;
  friend: string;
  percent: number;
  active: boolean;
}

const StakingScreen = () => {
  const {
    arrangements,
    loading,
    addArrangement,
    deleteStakingArrangement,
    toggleArrangementStatus,
  } = useStakingArrangements();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedArrangement, setSelectedArrangement] =
    useState<StakingArrangement | null>(null);
  const [friend, setFriend] = useState("");
  const [percent, setPercent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showDeleteDialog = (arrangement: StakingArrangement) => {
    setSelectedArrangement(arrangement);
    setDeleteDialogVisible(true);
  };

  const handleAddArrangement = async () => {
    if (!friend || !percent) {
      setError("Please fill in all fields");
      return;
    }

    const percentValue = parseFloat(percent);
    if (isNaN(percentValue) || percentValue <= 0 || percentValue > 100) {
      setError("Please enter a valid percentage between 0 and 100");
      return;
    }

    try {
      await addArrangement({
        friend,
        percent: percentValue,
        active: true,
      });
      setModalVisible(false);
      setFriend("");
      setPercent("");
      setError(null);
      setSnackbarMessage("Staking arrangement added successfully");
      setSnackbarVisible(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add arrangement"
      );
    }
  };

  const handleDeleteArrangement = async () => {
    if (!selectedArrangement) return;

    try {
      await deleteStakingArrangement(selectedArrangement.id);
      setError(null);
      setSnackbarMessage("Staking arrangement deleted successfully");
      setSnackbarVisible(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete arrangement"
      );
    } finally {
      setDeleteDialogVisible(false);
      setSelectedArrangement(null);
    }
  };

  const handleToggleStatus = async (id: string, active: boolean) => {
    try {
      await toggleArrangementStatus(id, !active);
      setError(null);
      setSnackbarMessage(
        `Arrangement ${!active ? "activated" : "deactivated"} successfully`
      );
      setSnackbarVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#9B51E0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staking</Text>
        <Text style={styles.headerSubtitle}>Profit Sharing</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {arrangements.map((arrangement) => (
          <TouchableOpacity
            key={arrangement.id}
            onLongPress={() => showDeleteDialog(arrangement)}
            style={styles.cardContainer}
          >
            <Surface style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.friendInfo}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color="#9B51E0"
                      style={styles.icon}
                    />
                    <View>
                      <Text style={styles.friendName}>
                        {arrangement.friend}
                      </Text>
                      <Text style={styles.percent}>
                        {arrangement.percent}% stake
                      </Text>
                    </View>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      handleToggleStatus(arrangement.id, arrangement.active)
                    }
                    textColor={arrangement.active ? "#9B51E0" : "#FF5252"}
                    style={[
                      styles.statusButton,
                      {
                        borderColor: arrangement.active ? "#9B51E0" : "#FF5252",
                      },
                    ]}
                  >
                    {arrangement.active ? "Active" : "Inactive"}
                  </Button>
                </View>
              </View>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons
              name="handshake"
              size={24}
              color="#9B51E0"
            />
            <Text style={styles.modalTitle}>New Staking Arrangement</Text>
          </View>
          <TextInput
            label="Friend's Name"
            value={friend}
            onChangeText={setFriend}
            style={styles.input}
            mode="outlined"
            outlineColor="#9B51E0"
            activeOutlineColor="#9B51E0"
            textColor="#FFFFFF"
          />
          <TextInput
            label="Percentage"
            value={percent}
            onChangeText={setPercent}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#9B51E0"
            activeOutlineColor="#9B51E0"
            textColor="#FFFFFF"
            right={<TextInput.Affix text="%" />}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button
            mode="contained"
            onPress={handleAddArrangement}
            style={styles.addButton}
            buttonColor="#9B51E0"
          >
            Add Arrangement
          </Button>
        </Modal>

        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Delete Arrangement
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to delete this staking arrangement? This
              action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDeleteDialogVisible(false)}
              textColor="#9B51E0"
            >
              Cancel
            </Button>
            <Button onPress={handleDeleteArrangement} textColor="#FF5252">
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
        {snackbarMessage}
      </Snackbar>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
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
    paddingBottom: 120, // Extra padding for FAB
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1A0A2E",
    borderRadius: 20,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    opacity: 0.8,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  percent: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  statusButton: {
    borderWidth: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90, // Moved up to avoid nav bar
    backgroundColor: "#9B51E0",
    borderRadius: 28,
  },
  modalContainer: {
    backgroundColor: "#1A0A2E",
    padding: 20,
    margin: 20,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#0A0515",
  },
  errorText: {
    color: "#FF5252",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  addButton: {
    marginTop: 8,
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
});

export default StakingScreen;
