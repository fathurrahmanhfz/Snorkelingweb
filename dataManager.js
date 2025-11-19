/**
 * DataManager - Handles all data persistence for the application.
 * Currently uses localStorage, but designed to be easily swapped with a backend API.
 */
class DataManager {
    constructor() {
        this.STORAGE_KEY = 'snorkeling_bookings';
    }

    /**
     * Get all bookings
     * @returns {Array} List of booking objects
     */
    getBookings() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Create a new booking
     * @param {Object} bookingData - The booking information
     * @returns {Object} The created booking with ID and timestamp
     */
    createBooking(bookingData) {
        const bookings = this.getBookings();

        const newBooking = {
            id: 'BK-' + Date.now().toString(36).toUpperCase(),
            createdAt: new Date().toISOString(),
            status: 'pending', // pending, confirmed, cancelled
            ...bookingData
        };

        bookings.push(newBooking);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));

        return newBooking;
    }

    /**
     * Update booking status
     * @param {String} id - Booking ID
     * @param {String} status - New status
     */
    updateBookingStatus(id, status) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === id);

        if (index !== -1) {
            bookings[index].status = status;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
            return true;
        }
        return false;
    }

    /**
     * Delete a booking
     * @param {String} id - Booking ID
     */
    deleteBooking(id) {
        let bookings = this.getBookings();
        bookings = bookings.filter(b => b.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
    }

    /**
     * Get dashboard statistics
     */
    getStats() {
        const bookings = this.getBookings();
        return {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            revenue: bookings.reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0)
        };
    }
}

// Export instance
window.dataManager = new DataManager();
console.log('DataManager loaded');
