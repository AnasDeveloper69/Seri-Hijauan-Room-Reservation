import { account } from "@/lib/appwrite";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock user data - replace with real data from Appwrite
const currentUser = {
  name: "John Doe",
  email: "john.doe@hotel.com",
  role: "Hotel Manager",
  joinedDate: "January 2024",
};

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await account.deleteSession("current");
              // Use replace to prevent going back to dashboard
              router.replace("/auth");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    color = "#4F46E5",
    showChevron = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    color?: string;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[styles.menuIconContainer, { backgroundColor: color + "20" }]}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
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
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => Alert.alert("Coming Soon", "Edit profile feature")}
              color="#4F46E5"
            />
            <MenuItem
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Update your password"
              onPress={() =>
                Alert.alert("Coming Soon", "Change password feature")
              }
              color="#4F46E5"
            />
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() =>
                Alert.alert("Coming Soon", "Notification settings")
              }
              color="#4F46E5"
            />
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Coming soon"
              color="#6B7280"
              showChevron={false}
            />
            <MenuItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => Alert.alert("Coming Soon", "Language selection")}
              color="#6B7280"
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="information-circle-outline"
              title="About App"
              subtitle="Version 1.0.0"
              onPress={() =>
                Alert.alert("Seri Hijauan Booking", "Version 1.0.0")
              }
              color="#6B7280"
            />
            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help using the app"
              onPress={() => Alert.alert("Coming Soon", "Help center")}
              color="#6B7280"
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Privacy"
              subtitle="Legal information"
              onPress={() => Alert.alert("Coming Soon", "Terms and privacy")}
              color="#6B7280"
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>
            {loading ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Member since {currentUser.joinedDate}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
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
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Menu Item
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  logoutButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  // Footer
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
