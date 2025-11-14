// Chat page authentication and initialization
document.addEventListener('DOMContentLoaded', function() {
    // Require authentication for chat
    if (typeof AuthManager !== 'undefined') {
        if (!AuthManager.isLoggedIn()) {
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }
        
        // Load user data for chat interface
        const userData = AuthManager.getUserData();
        if (userData) {
            updateChatUserInfo(userData);
        }
    }
});

function updateChatUserInfo(userData) {
    // Update user info in chat interface if elements exist
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = userData.full_name;
    });
    
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(element => {
        element.textContent = userData.email;
    });
}
