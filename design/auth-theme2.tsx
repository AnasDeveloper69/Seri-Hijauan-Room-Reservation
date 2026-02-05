// Alternative Premium Version with Gradient Background
// To use this, install: npx expo install expo-linear-gradient

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { Button } from "react-native-paper";

export default function AuthScreen() {
  // ... [Keep all your state and functions from the original file] ...
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

  // [Include all your validation and handler functions here]

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#4F46E5", "#7C3AED", "#EC4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Floating Logo */}
            <View style={styles.floatingLogoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🏨</Text>
              </View>
              <Text style={styles.mainTitleGradient}>Seri Hijauan</Text>
              <Text style={styles.appSubtitleGradient}>Booking Excellence</Text>
            </View>

            {/* Glass-morphism Auth Card */}
            <View style={styles.glassCard}>
              {/* Rest of your form content */}
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

              {/* Your form inputs go here */}

              <Button
                mode="contained"
                onPress={isLogin ? () => {} : () => {}} // Add your handlers
                style={styles.btnLoginGlass}
                contentStyle={styles.btnContent}
                labelStyle={styles.btnLabel}
                loading={loading}
                disabled={loading}
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
  },

  // Floating Logo Styles
  floatingLogoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 60,
  },
  mainTitleGradient: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appSubtitleGradient: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
  },

  // Glass-morphism Card
  glassCard: {
    marginHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
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

  // Button with gradient-style look
  btnLoginGlass: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    marginTop: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnContent: {
    paddingVertical: 10,
  },
  btnLabel: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
