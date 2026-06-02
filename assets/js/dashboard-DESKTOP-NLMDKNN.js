// Dashboard initialization and data loading
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AuthManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data
    loadDashboardData();
    loadUserBookings();
    loadUserStats();
    updateNotificationBadge();
    setActiveNavLink();
});

function setActiveNavLink() {
    // Set active state based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        // Check if link matches current page
        if (href === currentPage || 
            (currentPage === 'user-dashboard.html' && href === 'user-dashboard.html') ||
            (currentPage === '' && href === 'user-dashboard.html')) {
            link.classList.add('active');
        }
    });
}

function loadDashboardData() {
    const userData = AuthManager.getUserData();
    
    if (!userData) {
        console.error('No user data found');
        return;
    }

    // Ensure full_name exists
    const fullName = userData.full_name || userData.username || 'User';
    const firstName = userData.firstName || (fullName ? fullName.split(' ')[0] : 'User');

    // Update welcome message
    const welcomeElement = document.querySelector('.dashboard-welcome h2');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome back, ${firstName}!`;
    }

    // Update user profile info in sidebar or header
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = fullName;
    });

    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(element => {
        element.textContent = userData.email || '';
    });

    // Update user avatar with initials
    const initials = getInitials(fullName);
    const avatarElements = document.querySelectorAll('.profile-avatar, .user-avatar, .user-avatar-small');
    avatarElements.forEach(avatar => {
        avatar.setAttribute('data-initials', initials);
        avatar.textContent = initials;
    });
}

async function loadUserBookings() {
    const userData = AuthManager.getUserData();
    
    if (!userData || !userData.id) {
        console.error('No user data found');
        return;
    }

    let bookings = [];
    
    try {
        // Fetch bookings from backend API only
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/bookings/user/${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            bookings = await response.json();
            console.log('✅ Loaded bookings from Supabase:', bookings);
        } else {
            console.error('Failed to fetch bookings from database');
        }
    } catch (error) {
        console.error('Error loading bookings from API:', error);
        // Show error to user instead of using fallback
        const bookingsContainer = document.querySelector('.recent-bookings-container');
        if (bookingsContainer) {
            bookingsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Unable to load bookings. Please check your connection and try again.
                </div>
            `;
        }
        return;
    }

    // Display bookings in the dashboard
    const bookingsContainer = document.querySelector('.recent-bookings-container');
    if (bookingsContainer) {
        if (bookings.length === 0) {
            bookingsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No bookings yet. Start exploring local services!</p>
                    <a href="search-results.html" class="btn btn-primary mt-2">Browse Services</a>
                </div>
            `;
        } else {
            displayRecentBookings(bookings.slice(0, 5)); // Show only 5 most recent
        }
    }
}

function displayRecentBookings(bookings) {
    const container = document.querySelector('.recent-bookings-container');
    if (!container) return;

    container.innerHTML = bookings.map(booking => `
        <div class="booking-card p-3 border-bottom">
            <div class="row align-items-center">
                <div class="col-md-4">
                    <h6 class="mb-1">${booking.business_name || booking.businessName || booking.service_name || 'Service Provider'}</h6>
                    <p class="text-muted mb-0 small">${booking.service_name || booking.serviceType || 'Service'}</p>
                    ${booking.notes ? `<p class="text-muted mb-0 small"><i class="fas fa-info-circle"></i> ${booking.notes.substring(0, 50)}...</p>` : ''}
                </div>
                <div class="col-md-3">
                    <i class="far fa-calendar me-2"></i>
                    ${formatDate(booking.booking_date || booking.date)}
                </div>
                <div class="col-md-3">
                    <i class="far fa-clock me-2"></i>
                    ${booking.booking_time || booking.time || 'TBD'}
                </div>
                <div class="col-md-2">
                    <span class="status-badge ${getStatusClass(booking.status)}">${booking.status || 'pending'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function loadUserStats() {
    const userData = AuthManager.getUserData();
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    
    // Calculate stats - handle both database and localStorage field names
    const stats = {
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => 
            b.status === 'confirmed' || b.status === 'Confirmed' || 
            b.status === 'pending' || b.status === 'Pending'
        ).length,
        completedBookings: bookings.filter(b => 
            b.status === 'completed' || b.status === 'Completed'
        ).length,
        favoriteServices: JSON.parse(localStorage.getItem('favoriteServices') || '[]').length
    };

    // Update stat cards
    updateStatCard('total-bookings', stats.totalBookings);
    updateStatCard('active-bookings', stats.activeBookings);
    updateStatCard('completed-bookings', stats.completedBookings);
    updateStatCard('favorite-services', stats.favoriteServices);
}

function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function getInitials(name) {
    if (!name) return '??';
    
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function formatDate(dateString) {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getStatusClass(status) {
    const statusClasses = {
        'confirmed': 'bg-success text-white',
        'Confirmed': 'bg-success text-white',
        'pending': 'bg-warning text-dark',
        'Pending': 'bg-warning text-dark',
        'completed': 'bg-info text-white',
        'Completed': 'bg-info text-white',
        'cancelled': 'bg-danger text-white',
        'Cancelled': 'bg-danger text-white'
    };
    
    return statusClasses[status] || 'bg-secondary text-white';
}

function updateNotificationBadge() {
    // Get notification count (you can customize this based on your needs)
    const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.getElementById('notification-count');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Export functions for external use
window.DashboardManager = {
    loadDashboardData,
    loadUserBookings,
    loadUserStats,
    updateNotificationBadge
};
