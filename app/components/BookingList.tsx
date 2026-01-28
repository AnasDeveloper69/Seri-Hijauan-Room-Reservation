import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface Booking {
  id: string;
  date: string;
  roomName: string;
  bookedBy: string;
  checkin: string;
  checkout: string;
  deposit: "pending" | "completed";
}

interface BookingListProps {
  bookings: Booking[];
  currentMonth: string; // Format: "YYYY-MM"
  selectedDate?: string; // Format: "YYYY-MM-DD"
  onBookingPress?: (booking: Booking) => void;
}

export default function BookingList({
  bookings,
  currentMonth,
  selectedDate,
  onBookingPress,
}: BookingListProps) {
  // Filter bookings for current month
  const monthlyBookings = bookings.filter((booking) =>
    booking.date.startsWith(currentMonth),
  );

  // Filter bookings for selected date (if any)
  const selectedDateBookings = selectedDate
    ? bookings.filter((booking) => booking.date === selectedDate)
    : [];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format month for display
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (deposit: "pending" | "completed") => {
    return deposit === "completed" ? "#4CAF50" : "#FFA500";
  };

  // Get status background color (lighter version)
  const getStatusBackgroundColor = (deposit: "pending" | "completed") => {
    return deposit === "completed" ? "#E8F5E9" : "#FFF3E0";
  };

  // Render individual booking card
  const renderBookingCard = (booking: Booking) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => onBookingPress?.(booking)}
      activeOpacity={0.7}
    >
      {/* Date Badge */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>{formatDate(booking.date)}</Text>
      </View>

      {/* Booking Details */}
      <View style={styles.bookingDetails}>
        <View style={styles.headerRow}>
          <Text style={styles.roomName}>{booking.roomName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackgroundColor(booking.deposit) },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(booking.deposit) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(booking.deposit) },
              ]}
            >
              {booking.deposit === "completed" ? "Paid" : "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Booked by:</Text>
          <Text style={styles.value}>{booking.bookedBy}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>
            {booking.checkin} - {booking.checkout}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // If no bookings for the month, show empty state
  if (monthlyBookings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Bookings</Text>
          <Text style={styles.emptyMessage}>
            No bookings found for {formatMonth(currentMonth)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Selected Date Section - Only show if date is selected and has bookings */}
      {selectedDate && selectedDateBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {formatDate(selectedDate)} ({selectedDateBookings.length}{" "}
            {selectedDateBookings.length === 1 ? "booking" : "bookings"})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {selectedDateBookings.map((booking) => renderBookingCard(booking))}
          </ScrollView>
        </View>
      )}

      {/* Monthly Bookings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {formatMonth(currentMonth)} Bookings
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{monthlyBookings.length}</Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {monthlyBookings.filter((b) => b.deposit === "completed").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#FFA500" }]}>
              {monthlyBookings.filter((b) => b.deposit === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monthlyBookings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Booking List */}
        <ScrollView
          style={styles.bookingList}
          showsVerticalScrollIndicator={false}
        >
          {monthlyBookings
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .map((booking) => renderBookingCard(booking))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    flexDirection: "row",
    paddingLeft: 15,
    paddingBottom: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  countBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  horizontalScroll: {
    paddingLeft: 15,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  bookingList: {
    paddingHorizontal: 15,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    marginRight: 12,
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateBadge: {
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  bookingDetails: {
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginRight: 8,
    minWidth: 80,
  },
  value: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
