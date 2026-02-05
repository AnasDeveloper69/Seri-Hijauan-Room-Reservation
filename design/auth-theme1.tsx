import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { Account, ID } from "react-native-appwrite";
import { Button, HelperText, TextInput } from "react-native-paper";
import { client } from "../appwrite";

export default function AuthScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Clear form when switching auth modes
  const clearForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setErrors({ username: "", email: "", password: "" });
  };

  // Validate username
  const validateUsername = (username: string) => {
    return username.length >= 3;
  };

  // Validate email format (only for signup)
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // Handle form validation
  const validateForm = () => {
    let valid = true;
    const newErrors = { username: "", email: "", password: "" };

    if (!username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (!validateUsername(username)) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    // Email is only required for signup
    if (!isLogin) {
      if (!email.trim()) {
        newErrors.email = "Email is required";
        valid = false;
      } else if (!validateEmail(email)) {
        newErrors.email = "Please enter a valid email";
        valid = false;
      }
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle user registration
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const account = new Account(client);

      // Check if there's an active session and delete it
      try {
        await account.deleteSession("current");
      } catch (error) {
        // No active session, continue with registration
      }

      // Create account with email
      await account.create(
        ID.unique(),
        email.trim(),
        password,
        username.trim(),
      );

      // Set user preferences with role
      await account.createEmailPasswordSession(email.trim(), password);
      await account.updatePrefs({
        role: "hotel_manager",
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Account created successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create account");
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user login
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const account = new Account(client);

      // Check if there's an active session and delete it
      try {
        await account.deleteSession("current");
      } catch (error) {
        // No active session, continue with login
      }

      // For login, treat username as email if it contains @
      const loginEmail = username.includes("@")
        ? username
        : `${username}@yourdomain.com`;

      await account.createEmailPasswordSession(loginEmail.trim(), password);

      Alert.alert("Success", "Logged in successfully!");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error", "Invalid username or password");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearForm();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with Logo */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🏨</Text>
            </View>
            <Text style={styles.mainTitle}>Seri Hijauan</Text>
            <Text style={styles.appSubtitle}>Booking Management</Text>
            <View style={styles.decorativeLine} />
          </View>

          {/* Auth Card */}
          <View style={styles.authCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Join us to manage your bookings"}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                label="Username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrors({ ...errors, username: "" });
                }}
                autoCapitalize="none"
                placeholder="johndoe"
                mode="outlined"
                style={styles.input}
                outlineColor="#E5E7EB"
                activeOutlineColor="#4F46E5"
                error={!!errors.username}
                disabled={loading}
                onSubmitEditing={Keyboard.dismiss}
                returnKeyType="next"
                left={<TextInput.Icon icon="account-outline" />}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username}
              </HelperText>

              {!isLogin && (
                <>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors({ ...errors, email: "" });
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="john@example.com"
                    mode="outlined"
                    style={styles.input}
                    outlineColor="#E5E7EB"
                    activeOutlineColor="#4F46E5"
                    error={!!errors.email}
                    disabled={loading}
                    onSubmitEditing={Keyboard.dismiss}
                    returnKeyType="next"
                    left={<TextInput.Icon icon="email-outline" />}
                  />
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>
                </>
              )}

              <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: "" });
                }}
                autoCapitalize="none"
                placeholder="Enter your password"
                mode="outlined"
                secureTextEntry={secureText}
                style={styles.input}
                outlineColor="#E5E7EB"
                activeOutlineColor="#4F46E5"
                error={!!errors.password}
                disabled={loading}
                onSubmitEditing={isLogin ? handleLogin : handleSignUp}
                returnKeyType="done"
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={secureText ? "eye-off" : "eye"}
                    onPress={() => setSecureText(!secureText)}
                  />
                }
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>

              <Button
                mode="contained"
                onPress={isLogin ? handleLogin : handleSignUp}
                style={styles.btnLogin}
                contentStyle={styles.btnContent}
                labelStyle={styles.btnLabel}
                loading={loading}
                disabled={loading}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </Text>
                <TouchableOpacity onPress={toggleAuthMode} disabled={loading}>
                  <Text style={styles.toggleLink}>
                    {isLogin ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Seri Hijauan. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // Hero Section Styles
  heroSection: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 50,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: "center",
    // Add gradient effect (requires additional setup)
  },
  appSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: "#4F46E5",
    borderRadius: 2,
    marginTop: 16,
  },

  // Auth Card Styles
  authCard: {
    marginHorizontal: 24,
    marginTop: -20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  formContainer: {
    gap: 4,
  },

  // Input Styles
  input: {
    marginBottom: 4,
    backgroundColor: "#FFFFFF",
    ...(Platform.OS === "web" && {
      outlineStyle: "none" as any,
    }),
  },

  // Button Styles
  btnLogin: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnContent: {
    paddingVertical: 8,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Divider Styles
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },

  // Toggle Styles
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  toggleText: {
    color: "#6B7280",
    fontSize: 15,
  },
  toggleLink: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "700",
  },

  // Footer Styles
  footer: {
    marginTop: 40,
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
