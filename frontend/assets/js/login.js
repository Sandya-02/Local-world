document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Load saved credentials on page load
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
    
    if (savedPassword) {
        passwordInput.value = savedPassword;
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const eyeIcon = this.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store the token
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('token', data.token);
                
                // Store user data with consistent format
                const userData = {
                    id: data.user.id,
                    username: data.user.username || data.user.email.split('@')[0],
                    email: data.user.email,
                    full_name: data.user.full_name,
                    phone: data.user.phone,
                    address: data.user.address,
                    user_type: data.user.user_type,
                    firstName: data.user.full_name ? data.user.full_name.split(' ')[0] : '',
                    lastName: data.user.full_name ? data.user.full_name.split(' ').slice(1).join(' ') : ''
                };
                
                storage.setItem('userData', JSON.stringify(userData));
                storage.setItem('userEmail', data.user.email);
                storage.setItem('isLoggedIn', 'true');
                
                // Save credentials if "Remember me" is checked
                if (rememberMe) {
                    localStorage.setItem('savedEmail', email);
                    localStorage.setItem('savedPassword', password);
                } else {
                    // Clear saved credentials if not remembering
                    localStorage.removeItem('savedEmail');
                    localStorage.removeItem('savedPassword');
                }
                
                // Initialize bookings if not exists
                if (!localStorage.getItem('userBookings')) {
                    localStorage.setItem('userBookings', JSON.stringify([]));
                }

                // Redirect based on user type
                if (data.user.user_type === 'seller') {
                    window.location.href = 'seller-dashboard.html';
                } else {
                    window.location.href = '/user-dashboard.html';
                }
            } else {
                // Show error message
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
        }
    });

    // Error message display function
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        errorDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        loginForm.insertAdjacentElement('beforebegin', errorDiv);

        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}); 