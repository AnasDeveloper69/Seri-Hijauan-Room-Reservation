// services/UPDATE/updateBooking.ts
import { databases, DATABASE_ID, BOOKINGS_COLLECTION_ID } from '../../lib/appwrite';
import { BookingData, AppwriteBooking } from '../types';

/**
 * Update any part of a booking
 * @param documentId - The Appwrite $id of the booking
 * @param updateData - Partial object of BookingData
 */
export const updateBooking = async (
    documentId: string, 
    updateData: Partial<BookingData>
) => {
    try {
        const response = await databases.updateDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            documentId,
            updateData
        );

        return {
            success: true,
            data: response as unknown as AppwriteBooking
        };
    } catch (error: any) {
        console.error('Error updating booking:', error);
        return {
            success: false,
            error: error.message || 'Failed to update booking'
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