import { account } from "@/lib/appwrite"; // Adjust path if needed
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  //=======================================
  // PLATFORM DETECTION
  //=======================================
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";
  const isMobile = isIOS || isAndroid;

  useEffect(() => {
    // Log platform information
    console.log("=== Platform Information ===");
    console.log("Platform.OS:", Platform.OS); // 'web', 'ios', 'android', 'windows', 'macos'
    console.log("Is Web:", isWeb);
    console.log("Is iOS:", isIOS);
    console.log("Is Android:", isAndroid);
    console.log("Is Mobile:", isMobile);
    console.log("Platform Version:", Platform.Version); // OS version
    console.log("===========================");

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await account.get(); // If this succeeds, user is logged in
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="coral" />
        {/* Optional: Show platform info during loading */}
        <Text style={{ marginTop: 16, color: "#666" }}>
          Loading on {Platform.OS}...
        </Text>
      </View>
    );
  }

  // Redirect based on auth status and platform
  if (isAuthenticated && isMobile) {
    return <Redirect href="/(tabs)/home" />;
  }
  if (isAuthenticated && isWeb) {
    return <Redirect href="/web/home" />;
  }

  return <Redirect href="/auth" />;
}
