// services/CREATE/createBooking.ts
import { databases, ID, DATABASE_ID, BOOKINGS_COLLECTION_ID } from '../../lib/appwrite';
import { BookingData } from '../types'; // Import from shared types

export const createBooking = async (bookingData: BookingData) => {
    try {
        console.log('Creating booking...', bookingData);

        const response = await databases.createDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            ID.unique(),
            bookingData
        );

        console.log('Booking created successfully:', response.$id);


        return {
            success: true,
            data: response
        };
    } catch (error: any) {
        console.error('Appwrite Create Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create booking' ,
            code: (error as any)?.code

        };
    }
};