import { bookingService } from "@/services/bookingService";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import BookingList from "../components/BookingList";

// ========================================
// INTERFACES & TYPES
// ========================================
interface Booking {
  id: string;
  date: string; // YYYY-MM-DD format (check-in date)
  room: string;
  bookedBy: string;
  checkin: string; // DD-MM-YYYY format for display
  checkout: string; // DD-MM-YYYY format for display
  deposit: "pending" | "completed";
}

// ========================================
// MAIN CALENDAR VIEW COMPONENT
// ========================================
export default function CalendarView() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ========================================
  // DATE FORMATTING FUNCTIONS
  // ========================================

  /**
   * Format date for calendar (YYYY-MM-DD)
   */
  const formatDateForCalendar = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      return "";
    }
  };

  /**
   * Format date for display (DD-MM-YYYY)
   */
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  /**
   * Convert DD-MM-YYYY to YYYY-MM-DD
   */
  const convertDisplayToCalendarFormat = (displayDate: string): string => {
    if (!displayDate || displayDate === "N/A") return "";

    try {
      const [day, month, year] = displayDate.split("-");
      return `${year}-${month}-${day}`;
    } catch (error) {
      return "";
    }
  };

  // ========================================
  // FETCH BOOKINGS FROM APPWRITE
  // ========================================
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const result = await bookingService.getAllBookings();

      if (result.success && result.data) {
        const mappedBookings: Booking[] = result.data.map((doc) => {
          const roomDisplay =
            doc.Rooms && doc.Rooms.length > 0
              ? doc.Rooms.join(", ")
              : "Room Not Assigned";

          return {
            id: doc.$id,
            date: formatDateForCalendar(doc.checkin), // Check-in date in YYYY-MM-DD
            room: roomDisplay,
            bookedBy: doc.fullName || "Guest",
            checkin: formatDateForDisplay(doc.checkin), // DD-MM-YYYY for display
            checkout: formatDateForDisplay(doc.checkout), // DD-MM-YYYY for display
            deposit:
              (doc.status?.toLowerCase() as "pending" | "completed") ??
              "pending",
          };
        });

        mappedBookings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setAllBookings(mappedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ========================================
  // FILTER BOOKINGS BY CURRENT MONTH
  // ========================================
  const monthlyBookings = allBookings.filter((booking) =>
    booking.date.startsWith(currentMonth),
  );

  // ========================================
  // IMPROVED: GENERATE MARKED DATES FOR CALENDAR
  // Marks entire booking period (check-in to check-out)
  // ========================================
  const getMarkedDates = () => {
    const marked: any = {};

    // Process all bookings (not just monthly) to show ranges that span across months
    allBookings.forEach((booking) => {
      // Get check-in date (already in YYYY-MM-DD format)
      const checkInDate = new Date(booking.date);

      // Convert checkout from DD-MM-YYYY to YYYY-MM-DD
      const checkOutKey = convertDisplayToCalendarFormat(booking.checkout);

      if (!checkOutKey) {
        // If checkout date is invalid, only mark check-in date
        const dateKey = booking.date;

        if (!marked[dateKey]) {
          marked[dateKey] = {
            dots: [],
            selected: dateKey === selected,
          };
        }

        marked[dateKey].dots.push({
          color: booking.deposit === "completed" ? "#007AFF" : "#FFA500",
        });
        return;
      }

      const checkOutDate = new Date(checkOutKey);

      // Mark all dates from check-in to check-out
      const currentDate = new Date(checkInDate);

      while (currentDate <= checkOutDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        // Initialize marked object for this date if it doesn't exist
        if (!marked[dateKey]) {
          marked[dateKey] = {
            dots: [],
            selected: dateKey === selected,
          };
        }

        // Add dot for this booking
        // Blue = completed, Orange = pending
        marked[dateKey].dots.push({
          color: booking.deposit === "completed" ? "#007AFF" : "#FFA500",
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Highlight selected date
    if (selected && marked[selected]) {
      marked[selected].selected = true;
      marked[selected].selectedColor = "#007AFF";
    }

    return marked;
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleMonthChange = (month: any) => {
    const newMonth = `${month.year}-${String(month.month).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
    setSelected("");
  };

  const handleDayPress = (day: any) => {
    setSelected(day.dateString);
  };

  const handleBookingPress = (booking: Booking) => {
    setSelected(booking.date);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // ========================================
  // CHECK IF MONTH HAS BOOKINGS
  // ========================================
  const hasBookingsInMonth = monthlyBookings.length > 0;

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading && allBookings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      >
        {/* Calendar Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Booking Calendar</Text>
          <Text style={styles.headerSubtitle}>
            {hasBookingsInMonth
              ? `${monthlyBookings.length} booking(s) this month`
              : "No bookings this month"}
          </Text>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <Calendar
            current={formatDateForCalendar(new Date().toISOString())}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
            theme={{
              todayTextColor: "#ff009d",
              arrowColor: "#007AFF",
              indicatorColor: "#007AFF",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
              selectedDayBackgroundColor: "#007AFF",
              selectedDayTextColor: "#FFFFFF",
              dotStyle: { marginTop: 2 },
            }}
          />

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#007AFF" }]}
              />
              <Text style={styles.legendText}>Paid </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FFA500" }]}
              />
              <Text style={styles.legendText}>Pending </Text>
            </View>
          </View>

          {/* Info text */}
          <Text style={styles.infoText}>
            📌 Dots show entire booking period from check-in to check-out
          </Text>
        </View>

        {/* Booking List */}
        {hasBookingsInMonth ? (
          <BookingList
            bookings={monthlyBookings}
            currentMonth={currentMonth}
            selectedDate={selected}
            onBookingPress={handleBookingPress}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Bookings</Text>
            <Text style={styles.emptyMessage}>
              No bookings found for this month
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#4F46E5",
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#C7D2FE",
  },
  calendarCard: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  infoText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
    margin: 15,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
