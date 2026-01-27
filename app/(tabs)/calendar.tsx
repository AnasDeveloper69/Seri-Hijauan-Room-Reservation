import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarView() {
  const [selected, setSelected] = useState("");
  const [refresh, setRefresh] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Calendar
          // Set the initial month/year displayed
          current={"2026-01-28"}
          // Handler for when a user taps a date
          onDayPress={(day) => {
            setSelected(day.dateString);
          }}
          // Highlight the selected date
          markedDates={{
            [selected]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: "#007AFF",
            },
          }}
          // Basic theme to clean up the look
          theme={{
            todayTextColor: "#ff009d",
            arrowColor: "#007AFF",
            indicatorColor: "#007AFF",
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  card: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 20,
    padding: 10,
  },
});
