// Booking page initialization and management
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AuthManager.isLoggedIn()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return;
    }

    // Load user bookings
    loadUserBookings();
    
    // Initialize booking form handlers
    initializeBookingHandlers();
});

function loadUserBookings() {
    const userData = AuthManager.getUserData();
    
    if (!userData) {
        console.error('No user data found');
        return;
    }

    // Get bookings from localStorage
    let bookings = [];
    const storedBookings = localStorage.getItem('userBookings');
    
    if (storedBookings) {
        try {
            bookings = JSON.parse(storedBookings);
        } catch (e) {
            console.error('Error parsing bookings:', e);
            bookings = [];
            localStorage.setItem('userBookings', JSON.stringify([]));
        }
    } else {
        // Initialize empty bookings for new users
        localStorage.setItem('userBookings', JSON.stringify([]));
    }

    // Display bookings
    displayBookings(bookings);
    
    // Update booking statistics
    updateBookingStats(bookings);
}

function displayBookings(bookings) {
    const bookingsContainer = document.querySelector('.bookings-list') || 
                             document.querySelector('.booking-grid') ||
                             document.getElementById('bookingsList');
    
    if (!bookingsContainer) {
        console.warn('Bookings container not found');
        return;
    }

    if (bookings.length === 0) {
        bookingsContainer.innerHTML = `
            <div class="no-bookings text-center py-5">
                <i class="fas fa-calendar-times fa-4x text-muted mb-3"></i>
                <h4 class="text-muted">No bookings yet</h4>
                <p class="text-muted mb-4">Start exploring local services and make your first booking!</p>
                <a href="search-results.html" class="btn btn-primary">
                    <i class="fas fa-search me-2"></i>Browse Services
                </a>
            </div>
        `;
        return;
    }

    // Sort bookings by date (most recent first)
    bookings.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    // Display bookings
    bookingsContainer.innerHTML = bookings.map((booking, index) => `
        <div class="booking-item card mb-3" data-booking-id="${booking.id || index}">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <h5 class="mb-1">${booking.businessName || 'Service Provider'}</h5>
                        <p class="text-muted mb-0">
                            <i class="fas fa-briefcase me-1"></i>
                            ${booking.serviceType || 'Service'}
                        </p>
                    </div>
                    <div class="col-md-2">
                        <small class="text-muted">Date</small>
                        <p class="mb-0">
                            <i class="far fa-calendar me-1"></i>
                            ${formatDate(booking.date)}
                        </p>
                    </div>
                    <div class="col-md-2">
                        <small class="text-muted">Time</small>
                        <p class="mb-0">
                            <i class="far fa-clock me-1"></i>
                            ${booking.time || 'TBD'}
                        </p>
                    </div>
                    <div class="col-md-2">
                        <small class="text-muted">Status</small>
                        <p class="mb-0">
                            <span class="badge ${getStatusBadgeClass(booking.status)}">
                                ${booking.status || 'Pending'}
                            </span>
                        </p>
                    </div>
                    <div class="col-md-3 text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="viewBookingDetails(${booking.id || index})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${booking.status === 'Pending' || booking.status === 'Confirmed' ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelBooking(${booking.id || index})">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : ''}
                    </div>
                </div>
                ${booking.notes ? `
                    <div class="row mt-3">
                        <div class="col-12">
                            <small class="text-muted">Notes:</small>
                            <p class="mb-0">${booking.notes}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function updateBookingStats(bookings) {
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        confirmed: bookings.filter(b => b.status === 'Confirmed').length,
        completed: bookings.filter(b => b.status === 'Completed').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled').length
    };

    // Update stat elements if they exist
    updateStatElement('total-bookings', stats.total);
    updateStatElement('pending-bookings', stats.pending);
    updateStatElement('confirmed-bookings', stats.confirmed);
    updateStatElement('completed-bookings', stats.completed);
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function initializeBookingHandlers() {
    // Handle "Book Now" buttons
    const bookNowButtons = document.querySelectorAll('.btn-primary');
    bookNowButtons.forEach(button => {
        if (button.textContent.includes('Book Now')) {
            button.addEventListener('click', handleBookNow);
        }
    });
}

function handleBookNow(event) {
    const card = event.target.closest('.booking-card');
    const serviceName = card.querySelector('h3')?.textContent || 'Service';
    
    // Show booking modal or redirect to booking form
    if (typeof bootstrap !== 'undefined' && document.getElementById('bookingModal')) {
        const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
        document.getElementById('modalServiceName').textContent = serviceName;
        modal.show();
    } else {
        // Store selected service and redirect
        sessionStorage.setItem('selectedService', serviceName);
        window.location.href = 'order-form.html';
    }
}

function viewBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const booking = bookings[bookingId];
    
    if (booking) {
        // Display booking details in a modal or redirect to details page
        alert(`Booking Details:\n\nService: ${booking.businessName}\nType: ${booking.serviceType}\nDate: ${booking.date}\nTime: ${booking.time}\nStatus: ${booking.status}`);
    }
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    
    if (bookings[bookingId]) {
        bookings[bookingId].status = 'Cancelled';
        bookings[bookingId].cancelledAt = new Date().toISOString();
        
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        
        // Reload bookings display
        loadUserBookings();
        
        alert('Booking cancelled successfully');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getStatusBadgeClass(status) {
    const statusClasses = {
        'Pending': 'bg-warning text-dark',
        'Confirmed': 'bg-success',
        'Completed': 'bg-info',
        'Cancelled': 'bg-danger'
    };
    
    return statusClasses[status] || 'bg-secondary';
}

// Export functions
window.BookingManager = {
    loadUserBookings,
    displayBookings,
    viewBookingDetails,
    cancelBooking,
    addBooking: function(bookingData) {
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const newBooking = {
            id: bookings.length,
            ...bookingData,
            createdAt: new Date().toISOString(),
            status: bookingData.status || 'Pending'
        };
        bookings.push(newBooking);
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        return newBooking;
    }
};
