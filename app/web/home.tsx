// app/web/home.tsx
import { client } from "@/appwrite";
import { bookingService } from "@/services/bookingService";
import React, { useEffect, useState } from "react";
import { Account } from "react-native-appwrite";

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
  deposit: number;
  status: "pending" | "completed";
  createdAt: string;
  total: number;
  balance: number;
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
// MAIN DASHBOARD COMPONENT FOR WEB
// ========================================
export default function WebBookingDashboard() {
  console.log("Web/home is working");

  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed"
  >("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Helper function to format dates consistently
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

  // Fetch user data from Appwrite
  const fetchUserData = async () => {
    try {
      const account = new Account(client);
      const user = await account.get();
      const prefs = await account.getPrefs();

      const userData = {
        name: user.name || "User",
        email: user.email,
        role: prefs.role || "keeper",
      };

      setCurrentUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setUserLoading(false);
    }
  };

  // Fetch bookings from Appwrite
  const fetchBookings = async () => {
    try {
      const result = await bookingService.getAllBookings();
      if (result.success && result.data) {
        const mappedBookings: Booking[] = result.data.map((doc) => ({
          id: doc.$id,
          customerName: doc.fullName || "N/A",
          rooms: doc.Rooms ?? [],
          checkin: formatDate(doc.checkin),
          checkout: formatDate(doc.checkout),
          adults: doc.numberOfAdults ?? 0,
          children: doc.numberOfChildren ?? 0,
          amount: doc.amount ?? 0,
          status:
            (doc.status?.toLowerCase() as "pending" | "completed") ?? "pending",
          deposit: parseFloat(doc.deposit) ?? 0,
          createdAt: formatDate(doc.$createdAt),
          total: parseFloat(doc.total) ?? 0,
          balance: parseFloat(doc.balance) ?? 0,
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

  useEffect(() => {
    fetchUserData();
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Calculate dashboard statistics
  const calculateStats = (): DashboardStats => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "pending",
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.status === "completed",
    ).length;

    const totalRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, booking) => sum + booking.total, 0);

    return {
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
    };
  };

  const stats = calculateStats();

  const getFilteredBookings = (): Booking[] => {
    if (filterStatus !== "all") {
      return bookings.filter((b) => b.status === filterStatus);
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  // ========================================
  // RENDER COMPONENTS
  // ========================================

  const renderUserProfile = () => {
    if (!currentUser) {
      return (
        <div style={webStyles.userProfileCard}>
          <p style={webStyles.emptyStateText}>Loading user...</p>
        </div>
      );
    }

    return (
      <div style={webStyles.userProfileCard}>
        <div style={webStyles.avatarContainer}>
          <span style={webStyles.avatarText}>
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
        <div style={webStyles.userInfo}>
          <h2 style={webStyles.userName}>{currentUser.name}</h2>
          <p style={webStyles.userEmail}>{currentUser.email}</p>
          <div style={webStyles.roleBadge}>
            <span style={webStyles.roleText}>
              {currentUser.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsCards = () => (
    <div style={webStyles.statsContainer}>
      {/* Total Bookings Card */}
      <div style={{ ...webStyles.statCard, ...webStyles.statCardBlue }}>
        <div style={webStyles.statContent}>
          <p style={webStyles.statNumber}>{stats.totalBookings}</p>
          <p style={webStyles.statLabel}>Total Bookings</p>
        </div>
        <div style={webStyles.statIcon}>
          <span style={webStyles.statIconText}>📊</span>
        </div>
      </div>

      {/* Pending Bookings Card */}
      <div style={{ ...webStyles.statCard, ...webStyles.statCardOrange }}>
        <div style={webStyles.statContent}>
          <p style={webStyles.statNumber}>{stats.pendingBookings}</p>
          <p style={webStyles.statLabel}>Pending</p>
        </div>
        <div style={webStyles.statIcon}>
          <span style={webStyles.statIconText}>⏳</span>
        </div>
      </div>

      {/* Completed Bookings Card */}
      <div style={{ ...webStyles.statCard, ...webStyles.statCardGreen }}>
        <div style={webStyles.statContent}>
          <p style={webStyles.statNumber}>{stats.completedBookings}</p>
          <p style={webStyles.statLabel}>Completed</p>
        </div>
        <div style={webStyles.statIcon}>
          <span style={webStyles.statIconText}>✅</span>
        </div>
      </div>
    </div>
  );

  const renderRevenueCard = () => (
    <div style={webStyles.revenueCard}>
      <div style={webStyles.revenueContent}>
        <p style={webStyles.revenueLabel}>Total Revenue (Completed)</p>
        <h1 style={webStyles.revenueAmount}>
          RM {stats.totalRevenue.toFixed(2)}
        </h1>
        <p style={webStyles.revenueSubtext}>
          From {stats.completedBookings} completed booking(s)
        </p>
      </div>
      <div style={webStyles.revenueIcon}>
        <span style={webStyles.revenueIconText}>💰</span>
      </div>
    </div>
  );

  const renderFilterButtons = () => (
    <div style={webStyles.filterContainer}>
      <h2 style={webStyles.filterTitle}>Booking List</h2>
      <div style={webStyles.filterButtons}>
        <button
          style={{
            ...webStyles.filterButton,
            ...(filterStatus === "all" ? webStyles.filterButtonActive : {}),
          }}
          onClick={() => setFilterStatus("all")}
          className="filter-btn"
        >
          <span
            style={{
              ...webStyles.filterButtonText,
              ...(filterStatus === "all"
                ? webStyles.filterButtonTextActive
                : {}),
            }}
          >
            All ({bookings.length})
          </span>
        </button>

        <button
          style={{
            ...webStyles.filterButton,
            ...(filterStatus === "pending" ? webStyles.filterButtonActive : {}),
          }}
          onClick={() => setFilterStatus("pending")}
          className="filter-btn"
        >
          <span
            style={{
              ...webStyles.filterButtonText,
              ...(filterStatus === "pending"
                ? webStyles.filterButtonTextActive
                : {}),
            }}
          >
            Pending ({stats.pendingBookings})
          </span>
        </button>

        <button
          style={{
            ...webStyles.filterButton,
            ...(filterStatus === "completed"
              ? webStyles.filterButtonActive
              : {}),
          }}
          onClick={() => setFilterStatus("completed")}
          className="filter-btn"
        >
          <span
            style={{
              ...webStyles.filterButtonText,
              ...(filterStatus === "completed"
                ? webStyles.filterButtonTextActive
                : {}),
            }}
          >
            Completed ({stats.completedBookings})
          </span>
        </button>
      </div>
    </div>
  );

  const renderBookingItem = (booking: Booking) => (
    <div
      key={booking.id}
      style={webStyles.bookingCard}
      className="booking-card"
    >
      <div style={webStyles.bookingHeader}>
        <div>
          <h3 style={webStyles.bookingCustomer}>{booking.customerName}</h3>
        </div>
        <div
          style={{
            ...webStyles.statusBadge,
            ...(booking.status === "completed"
              ? webStyles.statusBadgeCompleted
              : webStyles.statusBadgePending),
          }}
        >
          <span
            style={{
              ...webStyles.statusText,
              ...(booking.status === "completed"
                ? webStyles.statusTextCompleted
                : webStyles.statusTextPending),
            }}
          >
            {booking.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={webStyles.bookingDetails}>
        <div style={webStyles.bookingDetailRow}>
          <span style={webStyles.bookingDetailLabel}>🏨 Rooms:</span>
          <span style={webStyles.bookingDetailValue}>
            {booking.rooms.join(", ")}
          </span>
        </div>

        <div style={webStyles.bookingDetailRow}>
          <span style={webStyles.bookingDetailLabel}>📅 Check-in:</span>
          <span style={webStyles.bookingDetailValue}>{booking.checkin}</span>
        </div>

        <div style={webStyles.bookingDetailRow}>
          <span style={webStyles.bookingDetailLabel}>📅 Check-out:</span>
          <span style={webStyles.bookingDetailValue}>{booking.checkout}</span>
        </div>

        <div style={webStyles.bookingDetailRow}>
          <span style={webStyles.bookingDetailLabel}>👥 Guests:</span>
          <span style={webStyles.bookingDetailValue}>
            {booking.adults} Adult(s), {booking.children} Children(s)
          </span>
        </div>

        <div style={webStyles.bookingDetailRow}>
          <span style={webStyles.bookingDetailLabel}>💳 Payment:</span>
          <span style={webStyles.bookingDetailValue}>
            {booking.status === "completed" ? "Full Payment" : "Deposit"}
          </span>
        </div>

        <div style={webStyles.bookingDetailRow}>
          <span style={webStyles.bookingDetailLabel}>💵 Deposit Paid:</span>
          <span style={webStyles.bookingDetailValue}>
            RM {booking.deposit.toFixed(2)}
          </span>
        </div>

        <div style={webStyles.bookingDetailRow}>
          <span style={webStyles.bookingDetailLabel}>💰 Balance:</span>
          <span style={webStyles.bookingDetailValue}>
            RM {booking.balance.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={webStyles.bookingFooter}>
        <p style={webStyles.bookingAmount}>
          Total: RM {booking.total.toFixed(2)}
        </p>
        <p style={webStyles.bookingDate}>Booked: {booking.createdAt}</p>
      </div>
    </div>
  );

  const renderBookingList = () => (
    <div style={webStyles.bookingListContainer}>
      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => renderBookingItem(booking))
      ) : (
        <div style={webStyles.emptyState}>
          <p style={webStyles.emptyStateText}>
            No {filterStatus !== "all" ? filterStatus : ""} bookings found
          </p>
        </div>
      )}
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div style={webStyles.container}>
      <style>{cssStyles}</style>

      {/* Dashboard Header */}
      <div style={webStyles.header}>
        <div style={webStyles.headerContent}>
          <h1 style={webStyles.headerTitle}>Dashboard</h1>
          <p style={webStyles.headerSubtitle}>
            Welcome back! Here your booking overview
          </p>
        </div>
        <button
          style={webStyles.refreshButton}
          onClick={onRefresh}
          disabled={refreshing}
        >
          <span style={webStyles.refreshIcon}>{refreshing ? "🔄" : "↻"}</span>
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div style={webStyles.mainContent}>
        <div style={webStyles.contentContainer}>
          {/* User Profile Section */}
          {renderUserProfile()}

          {/* Statistics Cards - This is where the grid layout shines on web */}
          {renderStatsCards()}

          {/* Revenue Card */}
          {renderRevenueCard()}

          {/* Filter Buttons */}
          {renderFilterButtons()}

          {/* Booking List */}
          {renderBookingList()}
        </div>
      </div>
    </div>
  );
}

// ========================================
// WEB-OPTIMIZED STYLES
// The key difference here is that we're designing for larger screens
// with more horizontal space and mouse interactions
// ========================================
const webStyles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },

  header: {
    backgroundColor: "#4F46E5",
    padding: "32px 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#FFFFFF",
    margin: 0,
    marginBottom: "8px",
  },

  headerSubtitle: {
    fontSize: "16px",
    color: "#C7D2FE",
    margin: 0,
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "12px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  refreshIcon: {
    fontSize: "20px",
  },

  mainContent: {
    display: "flex",
    justifyContent: "center",
    padding: "24px",
  },

  // This max-width keeps content readable on very large screens
  // while still feeling spacious on typical desktop sizes
  contentContainer: {
    width: "100%",
    maxWidth: "1400px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  // User Profile Card - more horizontal on web
  userProfileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  avatarContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#4F46E5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "24px",
  },

  avatarText: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1F2937",
    margin: 0,
    marginBottom: "8px",
  },

  userEmail: {
    fontSize: "16px",
    color: "#6B7280",
    margin: 0,
    marginBottom: "12px",
  },

  roleBadge: {
    display: "inline-block",
    backgroundColor: "#EEF2FF",
    padding: "6px 16px",
    borderRadius: "12px",
  },

  roleText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4F46E5",
  },

  // Statistics Cards - grid layout for web instead of horizontal scroll
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },

  statCard: {
    borderRadius: "16px",
    padding: "32px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  },

  statCardBlue: {
    background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
  },

  statCardOrange: {
    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  },

  statCardGreen: {
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  },

  statContent: {
    position: "relative",
    zIndex: 1,
  },

  statNumber: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#FFFFFF",
    margin: 0,
    marginBottom: "8px",
  },

  statLabel: {
    fontSize: "16px",
    color: "#FFFFFF",
    opacity: 0.95,
    margin: 0,
  },

  statIcon: {
    position: "absolute",
    right: "24px",
    top: "24px",
    opacity: 0.2,
  },

  statIconText: {
    fontSize: "64px",
  },

  // Revenue Card
  revenueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderLeft: "6px solid #10B981",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  revenueContent: {
    flex: 1,
  },

  revenueLabel: {
    fontSize: "16px",
    color: "#6B7280",
    margin: 0,
    marginBottom: "12px",
  },

  revenueAmount: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#1F2937",
    margin: 0,
    marginBottom: "8px",
  },

  revenueSubtext: {
    fontSize: "14px",
    color: "#9CA3AF",
    margin: 0,
  },

  revenueIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#D1FAE5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  revenueIconText: {
    fontSize: "48px",
  },

  // Filter Section
  filterContainer: {
    marginBottom: "8px",
  },

  filterTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1F2937",
    margin: 0,
    marginBottom: "16px",
  },

  filterButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  filterButton: {
    flex: "1 1 auto",
    minWidth: "150px",
    padding: "14px 24px",
    borderRadius: "12px",
    backgroundColor: "#FFFFFF",
    border: "2px solid #E5E7EB",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  filterButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },

  filterButtonText: {
    color: "#6B7280",
  },

  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  // Booking List - uses CSS Grid for responsive columns on web
  bookingListContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
    gap: "24px",
  },

  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  bookingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #F3F4F6",
  },

  bookingCustomer: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1F2937",
    margin: 0,
  },

  statusBadge: {
    padding: "8px 16px",
    borderRadius: "12px",
  },

  statusBadgePending: {
    backgroundColor: "#FEF3C7",
  },

  statusBadgeCompleted: {
    backgroundColor: "#D1FAE5",
  },

  statusText: {
    fontSize: "13px",
    fontWeight: "bold",
  },

  statusTextPending: {
    color: "#92400E",
  },

  statusTextCompleted: {
    color: "#065F46",
  },

  bookingDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },

  bookingDetailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bookingDetailLabel: {
    fontSize: "15px",
    color: "#6B7280",
    flex: "0 0 40%",
  },

  bookingDetailValue: {
    fontSize: "15px",
    color: "#1F2937",
    fontWeight: "500",
    textAlign: "right",
    flex: "1 1 auto",
  },

  bookingFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: "1px solid #F3F4F6",
  },

  bookingAmount: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#10B981",
    margin: 0,
  },

  bookingDate: {
    fontSize: "14px",
    color: "#9CA3AF",
    margin: 0,
  },

  // Empty State
  emptyState: {
    gridColumn: "1 / -1",
    padding: "80px 40px",
    textAlign: "center",
  },

  emptyStateText: {
    fontSize: "18px",
    color: "#9CA3AF",
    margin: 0,
  },
};

// CSS for hover effects and responsive behavior
// This is where web really shines - we can add interactive states that aren't possible on mobile
const cssStyles = `
  .booking-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  }

  .filter-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  }

  .filter-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Responsive adjustments for smaller screens */
  @media (max-width: 768px) {
    .booking-list-container {
      grid-template-columns: 1fr !important;
    }
  }

  /* Smooth scrolling for the whole page */
  html {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar styling for WebKit browsers */
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: #F3F4F6;
  }

  ::-webkit-scrollbar-thumb {
    background: #9CA3AF;
    border-radius: 6px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #6B7280;
  }
`;
