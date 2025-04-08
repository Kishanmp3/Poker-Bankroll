import "react-native-get-random-values";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { TextInput, Button, Text, Snackbar, Surface } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useSessions } from "../hooks/useSupabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AddSessionScreen = () => {
  const navigation = useNavigation();
  const { addSession } = useSessions();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [buyIn, setBuyIn] = useState("");
  const [cashOut, setCashOut] = useState("");
  const [duration, setDuration] = useState("");
  const [game, setGame] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateForm = () => {
    if (!location) return "Location is required";
    if (!buyIn) return "Buy-in amount is required";
    if (!cashOut) return "Cash out amount is required";
    if (!duration) return "Duration is required";
    if (!game) return "Game type is required";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await addSession({
        date: date.toISOString().split("T")[0],
        location,
        buy_in: parseFloat(buyIn),
        cash_out: parseFloat(cashOut),
        duration: parseFloat(duration),
        game,
        notes: notes || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            Record New Session
          </Text>
          <MaterialCommunityIcons
            name="plus-circle"
            size={28}
            color="#808080"
          />
        </View>

        <View style={styles.form}>
          <Surface style={styles.dateCard}>
            <View style={styles.dateContent}>
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color="#808080"
              />
              <Button
                mode="text"
                onPress={() => setShowDatePicker(true)}
                textColor="#FFFFFF"
                style={styles.dateButton}
                labelStyle={styles.dateButtonText}
              >
                {date.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Button>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={handleDateChange}
                textColor="#FFFFFF"
              />
            )}
          </Surface>

          <View style={styles.inputPair}>
            <Surface style={[styles.inputCard, styles.halfWidth]}>
              <View style={styles.inputContent}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="#808080"
                />
                <TextInput
                  placeholder="Location"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                  mode="flat"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
              </View>
            </Surface>

            <Surface style={[styles.inputCard, styles.halfWidth]}>
              <View style={styles.inputContent}>
                <MaterialCommunityIcons
                  name="cards"
                  size={24}
                  color="#808080"
                />
                <TextInput
                  placeholder="Game Type"
                  value={game}
                  onChangeText={setGame}
                  style={styles.input}
                  mode="flat"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
              </View>
            </Surface>
          </View>

          <View style={styles.inputPair}>
            <Surface style={[styles.inputCard, styles.halfWidth]}>
              <View style={styles.inputContent}>
                <MaterialCommunityIcons name="cash" size={24} color="#808080" />
                <TextInput
                  placeholder="Buy-in"
                  value={buyIn}
                  onChangeText={setBuyIn}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="flat"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  left={
                    <TextInput.Affix text="$" textStyle={styles.affixText} />
                  }
                />
              </View>
            </Surface>

            <Surface style={[styles.inputCard, styles.halfWidth]}>
              <View style={styles.inputContent}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={24}
                  color="#808080"
                />
                <TextInput
                  placeholder="Cash Out"
                  value={cashOut}
                  onChangeText={setCashOut}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="flat"
                  textColor="#FFFFFF"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  left={
                    <TextInput.Affix text="$" textStyle={styles.affixText} />
                  }
                />
              </View>
            </Surface>
          </View>

          <Surface style={[styles.inputCard, styles.halfWidth]}>
            <View style={styles.inputContent}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#808080"
              />
              <TextInput
                placeholder="Duration (hours)"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                style={styles.input}
                mode="flat"
                textColor="#FFFFFF"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>
          </Surface>

          <Surface style={styles.notesCard}>
            <View style={styles.inputContent}>
              <MaterialCommunityIcons
                name="note-text"
                size={24}
                color="#808080"
              />
              <TextInput
                placeholder="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={styles.input}
                mode="flat"
                textColor="#FFFFFF"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            </View>
          </Surface>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonText}
            loading={loading}
            disabled={loading}
          >
            Save Session
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        style={styles.errorSnackbar}
      >
        <Text style={styles.errorText}>{error}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    letterSpacing: 0.5,
  },
  form: {
    gap: 16,
  },
  dateCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButton: {
    flex: 1,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  inputPair: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 16,
  },
  halfWidth: {
    flex: 1,
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  notesCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  notesInput: {
    minHeight: 100,
  },
  affixText: {
    color: "#808080",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  submitButton: {
    backgroundColor: "#2962FF",
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonContent: {
    height: 50,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
  errorSnackbar: {
    backgroundColor: "#4A4A4A",
  },
  errorText: {
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    letterSpacing: 0.5,
  },
});

export default AddSessionScreen;
