// services/types.ts
export interface BookingData {
    bookingId?: number;
    fullName: string;
    address?: string;
    phoneNumber: string;
    numberOfAdults: number;
    numberOfChildren?: number;
    vehicleLicensePlate?: string;
    checkin: string;
    checkout: string;
    Rooms: string[];
    deposit: 'Pending' | 'Completed';
    fullpayment?: 'deposit' | 'full';
    status?: 'pending' | 'completed';
    amount?: number;
}

export interface AppwriteBooking extends BookingData {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $collectionId: string;
    $databaseId: string;
}