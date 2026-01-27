import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function BookingHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Hotel Booking Form</Text>
      <Text style={styles.headerSubtitle}>
        Complete the form below to reserve your room
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#4F46E5",
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#C7D2FE",
  },
});
