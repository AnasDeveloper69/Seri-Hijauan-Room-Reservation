import { bookingService } from "@/services/bookingService";
import React, { useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ========================================
// INTERFACES & TYPES
// ========================================
interface Booking {
  id: string;
  customerName: string;
  rooms: string[];
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  amount: number;
  deposit: "pending" | "completed";
  paymentType: "deposit" | "full";
  status: "pending" | "completed";
  createdAt: string;
  total: string;
  balance: string;
}

interface User {
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

// ========================================
// MOCK DATA - Replace with real data from your backend
// ========================================
const currentUser: User = {
  name: "John Doe",
  email: "john.doe@hotel.com",
  role: "Hotel Manager",
};

// ========================================
// MAIN DASHBOARD COMPONENT
// ========================================
export default function BookingDashboard() {
  // State for filtering bookings (pending or completed)
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed"
  >("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState();

  const formatDate = (dateString: string): string => {
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

  // ========================================
  // FETCH BOOKINGS FROM APPWRITE
  // ========================================
  const fetchBookings = async () => {
    try {
      const result = await bookingService.getAllBookings();
      if (result.success && result.data) {
        // setBookings(result.data);
        const mappedBookings: Booking[] = result.data.map((doc) => ({
          id: doc.$id,
          customerName: doc.fullName || "N/A",
          rooms: doc.Rooms ?? [],
          checkin: formatDate(doc.checkin), // ← Now matches interface
          checkout: formatDate(doc.checkout), // ← Now matches interface
          adults: doc.numberOfAdults ?? 0,
          children: doc.numberOfChildren ?? 0,
          amount: doc.amount ?? 0,
          status: doc.status ?? "pending",
          paymentType: doc.fullpayment ?? "deposit", // ← Fixed: was doc.paymentType
          deposit:
            (doc.deposit?.toLowerCase() as "pending" | "completed") ??
            "pending", // ← Fixed: added type assertion
          createdAt: formatDate(doc.$createdAt),
          total: doc.total,
          balance: doc.balance,
        }));

        mappedBookings.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };
  // ========================================
  // CALCULATE DASHBOARD STATISTICS
  // ========================================
  const calculateStats = (): DashboardStats => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(
      (b) => b.deposit === "pending",
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.deposit === "completed",
    ).length;

    // Calculate total revenue from completed bookings
    const totalRevenue = bookings
      .filter((b) => b.deposit === "completed")
      .reduce((sum, booking) => sum + parseFloat(booking.total || "0"), 0);

    return {
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
    };
  };

  const stats = calculateStats();

  // ========================================
  // FILTER BOOKINGS BASED ON SELECTED STATUS
  // Returns bookings matching the current filter
  // ========================================
  const getFilteredBookings = (): Booking[] => {
    let result = bookings;

    if (filterStatus !== "all") {
      result = bookings.filter((b) => b.deposit === filterStatus);
    }

    return result;
  };

  const filteredBookings = getFilteredBookings();

  // ========================================
  // RENDER: User Profile Section
  // ========================================
  const renderUserProfile = () => (
    <View style={styles.userProfileCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {currentUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userEmail}>{currentUser.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{currentUser.role}</Text>
        </View>
      </View>
    </View>
  );

  // ========================================
  // RENDER: Statistics Cards
  // Shows total, pending, completed bookings and revenue
  // ========================================
  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      {/* Total Bookings Card */}
      <View style={[styles.statCard, styles.statCardBlue]}>
        <Text style={styles.statNumber}>{stats.totalBookings}</Text>
        <Text style={styles.statLabel}>Total Bookings</Text>
        <View style={styles.statIcon}>
          <Text style={styles.statIconText}>📊</Text>
        </View>
      </View>

      {/* Pending Bookings Card */}
      <View style={[styles.statCard, styles.statCardOrange]}>
        <Text style={styles.statNumber}>{stats.pendingBookings}</Text>
        <Text style={styles.statLabel}>Pending</Text>
        <View style={styles.statIcon}>
          <Text style={styles.statIconText}>⏳</Text>
        </View>
      </View>

      {/* Completed Bookings Card */}
      <View style={[styles.statCard, styles.statCardGreen]}>
        <Text style={styles.statNumber}>{stats.completedBookings}</Text>
        <Text style={styles.statLabel}>Completed</Text>
        <View style={styles.statIcon}>
          <Text style={styles.statIconText}>✅</Text>
        </View>
      </View>
    </View>
  );

  // ========================================
  // RENDER: Total Revenue Card
  // Shows total amount from completed bookings
  // ========================================
  const renderRevenueCard = () => (
    <View style={styles.revenueCard}>
      <View style={styles.revenueContent}>
        <Text style={styles.revenueLabel}>Total Revenue (Completed)</Text>
        <Text style={styles.revenueAmount}>
          RM {stats.totalRevenue.toFixed(2)}
        </Text>
        <Text style={styles.revenueSubtext}>
          From {stats.completedBookings} completed booking(s)
        </Text>
      </View>
      <View style={styles.revenueIcon}>
        <Text style={styles.revenueIconText}>💰</Text>
      </View>
    </View>
  );

  // ========================================
  // RENDER: Filter Buttons
  // Allows user to filter bookings by status
  // ========================================
  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Booking List</Text>
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus("all")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterStatus === "all" && styles.filterButtonTextActive,
            ]}
          >
            All ({bookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === "pending" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus("pending")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterStatus === "pending" && styles.filterButtonTextActive,
            ]}
          >
            Pending ({stats.pendingBookings})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === "completed" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus("completed")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterStatus === "completed" && styles.filterButtonTextActive,
            ]}
          >
            Completed ({stats.completedBookings})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ========================================
  // RENDER: Booking List Item
  // Each individual booking card in the list
  // ========================================
  const renderBookingItem = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          {/* <Text style={styles.bookingId}>{booking.id}</Text> */}
          <Text style={styles.bookingCustomer}>{booking.customerName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            booking.deposit === "completed"
              ? styles.statusBadgeCompleted
              : styles.statusBadgePending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              booking.deposit === "completed"
                ? styles.statusTextCompleted
                : styles.statusTextPending,
            ]}
          >
            {booking.deposit.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailLabel}>🏨 Rooms:</Text>
          <Text style={styles.bookingDetailValue}>
            {booking.rooms.join(", ")}
          </Text>
        </View>

        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailLabel}>📅 Check-in:</Text>
          <Text style={styles.bookingDetailValue}>{booking.checkin}</Text>
        </View>

        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailLabel}>📅 Check-out:</Text>
          <Text style={styles.bookingDetailValue}>{booking.checkout}</Text>
        </View>

        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailLabel}>👥 Guests:</Text>
          <Text style={styles.bookingDetailValue}>
            {booking.adults} Adult(s), {booking.children} Children(s)
          </Text>
        </View>

        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailLabel}>💳 Payment:</Text>
          <Text style={styles.bookingDetailValue}>
            {booking.paymentType === "full" ? "Full Payment" : "Deposit"}
          </Text>
        </View>
      </View>

      {/* footer */}
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingAmount}>
          Total: RM {parseFloat(booking.total).toFixed(2)}
        </Text>
        <Text style={styles.bookingDate}>Booked: {booking.createdAt}</Text>
        {/* <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditBooking(booking)}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  // ========================================
  // RENDER: Booking List
  // Shows all filtered bookings
  // ========================================
  const renderBookingList = () => (
    <View style={styles.bookingListContainer}>
      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => renderBookingItem(booking))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No {filterStatus !== "all" ? filterStatus : ""} bookings found
          </Text>
        </View>
      )}
    </View>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // ← Use state here
            onRefresh={onRefresh}
            colors={["#4F46E5"]} // Android
            tintColor="#4F46E5" // iOS
          />
        }
      >
        {/* Dashboard Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back! Here's your booking overview
          </Text>
        </View>

        <View style={styles.contentContainer}>
          {/* User Profile Section */}
          {renderUserProfile()}

          {/* Statistics Cards */}
          {renderStatsCards()}

          {/* Revenue Card */}
          {renderRevenueCard()}

          {/* Filter Buttons */}
          {renderFilterButtons()}

          {/* Booking List */}
          {renderBookingList()}
        </View>
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
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    paddingBottom: 40,
  },
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
  contentContainer: {
    padding: 16,
  },

  // User Profile Styles
  userProfileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },

  // Statistics Cards Styles
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  statCardBlue: {
    backgroundColor: "#3B82F6",
  },
  statCardOrange: {
    backgroundColor: "#F59E0B",
  },
  statCardGreen: {
    backgroundColor: "#10B981",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  statIcon: {
    position: "absolute",
    right: 12,
    top: 12,
    opacity: 0.3,
  },
  statIconText: {
    fontSize: 32,
  },

  // Revenue Card Styles
  revenueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  revenueContent: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  revenueSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  revenueIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  revenueIconText: {
    fontSize: 32,
  },

  // Filter Styles
  filterContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  // Booking List Styles
  bookingListContainer: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bookingId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 4,
  },
  bookingCustomer: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeCompleted: {
    backgroundColor: "#D1FAE5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  statusTextPending: {
    color: "#92400E",
  },
  statusTextCompleted: {
    color: "#065F46",
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bookingDetailLabel: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  bookingDetailValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  bookingAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
  },
  bookingDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Empty State Styles
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
