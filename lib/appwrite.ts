import {Account, Client, Databases, ID} from 'react-native-appwrite';

// Helper function to get environment variables
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

// Get environment variables
const ENDPOINT = requireEnv('EXPO_PUBLIC_APPWRITE_ENDPOINT');
const PROJECT_ID = requireEnv('EXPO_PUBLIC_APPWRITE_PROJECT_ID');
const PLATFORM = requireEnv('EXPO_PUBLIC_APPWRITE_PLATFORM');

export const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setPlatform(PLATFORM);

export const account = new Account(client);
export const databases = new Databases(client);

// Export the ID utility for generating unique IDs
export {ID};

// Database and Collection IDs 
export const DATABASE_ID = requireEnv('EXPO_PUBLIC_APPWRITE_DATABASE_ID');
export const BOOKINGS_COLLECTION_ID = requireEnv('EXPO_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID');