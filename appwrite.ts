import { Client } from 'react-native-appwrite';

// Get environment variables
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_PLATFORM = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM;

// Validate environment variables
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_PLATFORM) {
    throw new Error(
        'Missing Appwrite environment variables. Please check your .env.local file.'
    );
}

// Initialize Appwrite Client
export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setPlatform(APPWRITE_PLATFORM);

// Optional: Export Account service for reuse
export { Account, ID } from 'react-native-appwrite';