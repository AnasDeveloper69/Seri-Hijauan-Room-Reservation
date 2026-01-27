// services/GET/getBookings.ts
import { databases, DATABASE_ID, BOOKINGS_COLLECTION_ID } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { AppwriteBooking } from '../types';

/**
 * Fetch all bookings from the collection
 */
export const getAllBookings = async () => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [Query.orderDesc('$createdAt')] // Good practice to show newest first
        );
        
        return { 
            success: true, 
            data: response.documents as unknown as AppwriteBooking[] 
        };
    } catch (error: any) {
        console.error('Error fetching all bookings:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to fetch bookings',
            data: [] 
        };
    }
};

/**
 * Fetch bookings filtered by deposit status
 */
export const getBookingsByStatus = async (status: 'Pending' | 'Completed') => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [
                Query.equal('deposit', status),
                Query.orderDesc('$createdAt'),
            ]
        );

        return {
            success: true,
            data: response.documents as unknown as AppwriteBooking[]
        };
    } catch (error: any) {
        console.error(`Error fetching ${status} bookings:`, error);
        return {
            success: false,
            error: error.message || 'Failed to fetch bookings by status',
            data: []
        };
    }
};