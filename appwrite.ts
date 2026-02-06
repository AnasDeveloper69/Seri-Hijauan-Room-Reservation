import Constants from "expo-constants";
import { Client } from "react-native-appwrite";

// Get environment variables from expo-constants
const APPWRITE_ENDPOINT = Constants.expoConfig?.extra?.appwriteEndpoint;
const APPWRITE_PROJECT_ID = Constants.expoConfig?.extra?.appwriteProjectId;
const APPWRITE_PLATFORM = Constants.expoConfig?.extra?.appwritePlatform;

// Validate environment variables
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_PLATFORM) {
  throw new Error(
    "Missing Appwrite environment variables. Please check your configuration.",
  );
}

// Initialize Appwrite Client
export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setPlatform(APPWRITE_PLATFORM);

// Optional: Export Account service for reuse
export { Account, ID } from "react-native-appwrite";

