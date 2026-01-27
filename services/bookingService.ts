import { Query } from "react-native-appwrite";
import {
    BOOKINGS_COLLECTION_ID,
    DATABASE_ID,
    databases,
    ID,
} from "../lib/appwrite";

export interface BookingData {
  bookingId?: number; // Optional since it has default value 0
  fullName: string; // Changed from customerName
  address?: string; // Optional (NULL allowed)
  phoneNumber: string; // Changed from phone
  numberOfAdults: number; // Changed from adults
  numberOfChildren?: number; // Changed from children (NULL allowed)
  vehicleLicensePlate?: string; // Changed from transportPlate (NULL allowed)
  checkin: string; // Changed from checkIn (datetime)
  checkout: string; // Changed from checkOut (datetime)
  Rooms: string[]; // Changed from rooms (note: capital R)
  deposit: "Pending" | "Completed"; // This is the required enum field
  fullpayment?: "true" | "false"; // Optional enum (NULL allowed)
  status?: "pending" | "completed"; // Add if you have a status field
  amount?: number;
  total?: string;
  balance?: string; // Add if you have an amount field
}

// Interface for Appwrite document response
export interface AppwriteBooking extends BookingData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

export const bookingService = {
  // create booking
  createBooking: async (bookingData: BookingData) => {
    try {
      console.log("Creating booking with data", bookingData);

      const response = await databases.createDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        ID.unique(), // genereate unique ID automatically
        bookingData,
      );

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.log("Error creating booking", error);
      return {
        success: false,
        error: error.message || "Failed to create booking",
      };
    }
  },

  // get all bookings
  getAllBookings: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
      );

      return { success: true, data: response.documents };
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch bookings",
      };
    }
  },

  // Get bookings by status
  getBookingsByStatus: async (status: "Pending" | "Completed") => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        [Query.equal("deposit", status), Query.orderDesc("$createdAt")],
      );

      return {
        success: true,
        data: response.documents as unknown as AppwriteBooking[], // Add 'unknown' cast
      };
    } catch (error: any) {
      console.error("Error fetching bookings by status:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch bookings",
        data: [] as AppwriteBooking[],
      };
    }
  },

  // calculate booking amount
  calculateAmount: (
    rooms: string[],
    checkIn: string,
    checkOut: string,
  ): number => {
    // Room prices per night
    const roomPrices: { [key: string]: number } = {
      seroja: 350,
      dahlia: 180,
      adelia: 150,
    };

    // Calculate number of nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Calculate total room cost
    const roomTotal = rooms.reduce((sum, roomId) => {
      return sum + (roomPrices[roomId] || 0);
    }, 0);

    // Total calculation
    const total = roomTotal * nights;

    return total;
  },
};
