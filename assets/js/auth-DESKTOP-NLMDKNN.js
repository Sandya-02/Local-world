// Authentication Management for LocalFinder

// Check authentication status and update UI
async function checkAuthStatus() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
        updateNavigationForGuest();
        return false;
    }
    
    // Verify token with backend and get fresh user data
    try {
        const response = await fetch('http://localhost:3000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            // Update cached data
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(userData));
            storage.setItem('userEmail', userData.email);
            storage.setItem('isLoggedIn', 'true');
            
            updateNavigationForLoggedInUser(userData.email, JSON.stringify(userData));
            return true;
        } else {
            // Token invalid, clear storage
            clearAuthData();
            updateNavigationForGuest();
            return false;
        }
    } catch (error) {
        console.error('Auth verification failed:', error);
        // Fallback to cached data if API is unreachable
        const cachedData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        
        if (cachedData && userEmail) {
            updateNavigationForLoggedInUser(userEmail, cachedData);
            return true;
        }
        
        updateNavigationForGuest();
        return false;
    }
}

// Update navigation for logged-in users
function updateNavigationForLoggedInUser(email, userDataStr) {
    const authNav = document.getElementById('authNav');
    if (!authNav) return;
    
    let userName = email.split('@')[0];
    
    // Try to get full name from userData
    if (userDataStr) {
        try {
            const userData = JSON.parse(userDataStr);
            if (userData.firstName) {
                userName = userData.firstName;
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
    
    authNav.innerHTML = `
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-user-circle me-1"></i> ${userName}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="user-dashboard.html">
                    <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                </a></li>
                <li><a class="dropdown-item" href="profile.html">
                    <i class="fas fa-user me-2"></i>My Profile
                </a></li>
                <li><a class="dropdown-item" href="booking.html">
                    <i class="fas fa-calendar-alt me-2"></i>My Bookings
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="handleLogout(); return false;">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a></li>
            </ul>
        </li>
    `;
}

// Update navigation for guests
function updateNavigationForGuest() {
    const authNav = document.getElementById('authNav');
    if (!authNav) return;
    
    authNav.innerHTML = `
        <li class="nav-item">
            <a class="nav-link btn-outline-primary me-2" href="login.html">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link btn-primary" href="registration.html">
                <i class="fas fa-user-plus"></i> Register
            </a>
        </li>
    `;
}

// Handle logout
function handleLogout() {
    // Show confirmation
    if (confirm('Are you sure you want to logout?')) {
        // Clear all authentication data
        localStorage.removeItem('isLoggedIn');
// Clear all authentication data
function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userData');
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        clearAuthData();
        
        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// Protect pages that require authentication
async function requireAuth(redirectUrl = 'login.html') {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
        // Store the intended destination
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        // Redirect to login
        window.location.href = redirectUrl;
        return false;
    }
    
    // Verify token is still valid
    try {
        const response = await fetch('http://localhost:3000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            clearAuthData();
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = redirectUrl;
            return false;
        }
        
        return true;
    } catch (error) {
        // If API is down, allow with cached data
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        return !!userData;
    }
}

// Redirect after login (if there was an intended destination)
function handlePostLoginRedirect() {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
        return true;
    }
    return false;
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Export functions for use in other scripts
window.AuthManager = {
    checkAuthStatus,
    requireAuth,
    handleLogout,
    handlePostLoginRedirect,
    isLoggedIn: () => {
        return localStorage.getItem('isLoggedIn') === 'true' || 
               sessionStorage.getItem('isLoggedIn') === 'true';
    },
    getUserEmail: () => {
        return localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    },
    getUserData: () => {
        const dataStr = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        try {
            return dataStr ? JSON.parse(dataStr) : null;
        } catch (e) {
            return null;
        }
    }
};
