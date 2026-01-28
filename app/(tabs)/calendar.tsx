import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import BookingList from "../components/BookingList";

interface Booking {
  id: string;
  date: string;
  roomName: string;
  bookedBy: string;
  checkin: string;
  checkout: string;
  deposit: "pending" | "completed";
}

// Sample Booking data
const SAMPLE_BOOKINGS: Booking[] = [
  {
    id: "1",
    date: "2026-01-28",
    roomName: "Conference Room A",
    bookedBy: "John Doe",
    checkin: "09:00",
    checkout: "11:00",
    deposit: "pending",
  },
  {
    id: "2",
    date: "2026-01-28",
    roomName: "Meeting Room B",
    bookedBy: "Jane Smith",
    checkin: "14:00",
    checkout: "16:00",
    deposit: "completed",
  },
  {
    id: "3",
    date: "2026-01-30",
    roomName: "Conference Room A",
    bookedBy: "Mike Johnson",
    checkin: "10:00",
    checkout: "12:00",
    deposit: "pending",
  },
  {
    id: "4",
    date: "2026-01-31",
    roomName: "Board Room",
    bookedBy: "Sarah Williams",
    checkin: "13:00",
    checkout: "15:00",
    deposit: "completed",
  },
  {
    id: "5",
    date: "2026-02-03",
    roomName: "Meeting Room C",
    bookedBy: "Tom Brown",
    checkin: "09:00",
    checkout: "10:30",
    deposit: "completed",
  },
];

export default function CalendarView() {
  const [selected, setSelected] = useState("");
  const [currentMonth, setCurrentMonth] = useState("2026-01");
  const [bookings, setBookings] = useState<Booking[]>(SAMPLE_BOOKINGS);

  // Generate Marked dates on the calendar
  const getMarkedDates = () => {
    const marked: any = {};

    // logic for each booking list found
    bookings.forEach((booking) => {
      const dateKey = booking.date;

      // Handle multiple bookings per date
      if (!marked[dateKey]) {
        marked[dateKey] = {
          dots: [],
          selected: dateKey === selected,
        };
      }

      // Add dot for each booking
      marked[dateKey].dots.push({
        color: booking.deposit === "completed" ? "#007AFF" : "#FFA500",
      });
    });

    return marked;
  };

  // Handle month change
  const handleMonthChange = (month: any) => {
    const newMonth = `${month.year}-${String(month.month).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
  };

  // Handle booking press
  const handleBookingPress = (booking: Booking) => {
    setSelected(booking.date);
    // You can add additional logic here (e.g., show details modal)
  };

  // Check if current month has bookings
  const hasBookingsInMonth = bookings.some((booking) =>
    booking.date.startsWith(currentMonth),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Calendar Card */}
        <View style={styles.card}>
          <Calendar
            // Set the initial month/year displayed
            current={"2026-01-28"}
            // Handler for when a user taps a date
            onDayPress={(day) => {
              setSelected(day.dateString);
            }}
            // Handler for month change
            onMonthChange={handleMonthChange}
            // Marked dates with dots
            markedDates={getMarkedDates()}
            // Basic theme to clean up the look
            theme={{
              todayTextColor: "#ff009d",
              arrowColor: "#007AFF",
              indicatorColor: "#007AFF",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            // Multi dot indicator
            markingType={"multi-dot"}
          />
        </View>

        {/* Booking List - Only show if month has bookings */}
        {hasBookingsInMonth && (
          <BookingList
            bookings={bookings}
            currentMonth={currentMonth}
            selectedDate={selected}
            onBookingPress={handleBookingPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  card: {
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
});
