// services/utils.ts
export const calculateAmount = (
    rooms: string[],
    checkIn: string,
    checkOut: string
): number => {
    const roomPrices: { [key: string]: number } = {
        seroja: 100,
        dahlia: 150,
        adelia: 200,
    };

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const roomTotal = rooms.reduce((sum, roomId) => sum + (roomPrices[roomId] || 0), 0);
    return roomTotal * nights;
};