// services/UPDATE/updateBooking.ts
import { databases, DATABASE_ID, BOOKINGS_COLLECTION_ID } from '../../lib/appwrite';
import { BookingData, AppwriteBooking } from '../types';

/**
 * Update any part of a booking
 * @param documentId - The Appwrite $id of the booking
 * @param updateData - Partial object of BookingData
 */
export const updateBooking = async (
  bookingId: string,
  updates: {
    deposit?: number;
    status?: "pending" | "completed";
    amount?: number;
    balance?: number;
  }
) => {
  try {
    // Use the same database and collection IDs you're using in getAllBookings
    const response = await databases.updateDocument(
      DATABASE_ID,              // Same as in your getAllBookings
      BOOKINGS_COLLECTION_ID,   // Same as in your getAllBookings
      bookingId,
      updates
    );

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    return {
      success: false,
      error: error,
    };
  }
};
/**
 * Specifically update payment status (convenience function)
 */
export const updatePaymentStatus = async (
    documentId: string, 
    status: 'Pending' | 'Completed'
) => {
    return await updateBooking(documentId, { deposit: status });
};