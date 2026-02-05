import BookingForm from "@/app/(tabs)/booking";
import { Query } from "react-native-appwrite";
import {
  BOOKINGS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  ID,
} from "../lib/appwrite";

export interface BookingData {
  bookingId?: number;
  fullName: string;
  address?: string;
  phoneNumber: string;
  NumAdults: number;
  NumChildren?: number;
  vehicleLicensePlate?: string;
  checkin: string;
  checkout: string;
  Rooms: string[];
  deposit?: number; // Changed to match your usage
  amount?: number; // Add this for deposit amount
  fullpayment?: "true" | "false";
  status?: "pending" | "completed";
  total?: number;
  balance?: number;
  paymentType?: "deposit" | "full";
}

// Interface for update operations
export interface UpdateBookingData {
  amount?: number;
  balance?: number | string;
  deposit?: "pending" | "completed";
  status?: "pending" | "completed";
  fullName?: string;
  phoneNumber?: string;
  NumAdults?: number;
  NumChildren?: number;
  checkin?: string;
  checkout?: string;
  Rooms?: string[];
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
        ID.unique(),
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
        data: response.documents as unknown as AppwriteBooking[],
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

  // UPDATE BOOKING - ADD THIS METHOD
  updateBooking: async (bookingId: string, updateData: UpdateBookingData) => {
    try {
      console.log("Updating booking:", bookingId, "with data:", updateData);

      const response = await databases.updateDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        bookingId,
        updateData,
      );

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Error updating booking:", error);
      return {
        success: false,
        error: error.message || "Failed to update booking",
      };
    }
  },

  // DELETE BOOKING (Optional but useful)
  deleteBooking: async (bookingId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        bookingId,
      );

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      return {
        success: false,
        error: error.message || "Failed to delete booking",
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

export default BookingForm;
