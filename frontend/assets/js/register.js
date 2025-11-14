document.addEventListener('DOMContentLoaded', function() {
    const userType = document.getElementById('userType');
    const businessSection = document.getElementById('businessSection');
    const registrationForm = document.getElementById('registrationForm');

    // Toggle business section based on user type
    userType.addEventListener('change', function() {
        businessSection.style.display = this.value === 'seller' ? 'block' : 'none';
        
        // Toggle required attributes for business fields
        const businessFields = businessSection.querySelectorAll('input, select, textarea');
        businessFields.forEach(field => {
            field.required = this.value === 'seller';
        });
    });

    // Handle form submission
    registrationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate passwords match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Collect basic user data
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: password,
            full_name: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            user_type: userType.value
        };

        try {
            let userResult;
            let registrationSuccessful = false;

            // Try API registration first
            try {
                const userResponse = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                userResult = await userResponse.json();

                if (userResponse.ok) {
                    registrationSuccessful = true;
                    
                    // If registering as seller, submit business information
                    if (userType.value === 'seller') {
                        const businessData = {
                            user_id: userResult.userId,
                            business_name: document.getElementById('businessName').value,
                            business_type: document.getElementById('businessType').value,
                            description: document.getElementById('businessDescription').value,
                            address: document.getElementById('businessAddress').value,
                            phone: document.getElementById('businessPhone').value,
                            email: document.getElementById('businessEmail').value,
                            website: document.getElementById('website').value,
                            operating_hours: document.getElementById('operatingHours').value
                        };

                        const sellerResponse = await fetch('/api/sellers/register', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(businessData)
                        });

                        const sellerResult = await sellerResponse.json();

                        if (!sellerResponse.ok) {
                            throw new Error(sellerResult.message || 'Error registering business');
                        }
                    }
                } else {
                    throw new Error(userResult.message || 'Error registering user');
                }
            } catch (apiError) {
                console.log('API registration failed, saving locally:', apiError.message);
                
                // Save user to localStorage for offline functionality
                const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                
                // Check if email already exists
                if (registeredUsers.some(user => user.email === userData.email)) {
                    throw new Error('Email already registered');
                }
                
                // Create user data with ID
                userResult = {
                    userId: Date.now(),
                    user: {
                        id: Date.now(),
                        username: userData.username,
                        email: userData.email,
                        full_name: userData.full_name,
                        phone: userData.phone,
                        address: userData.address,
                        user_type: userData.user_type
                    }
                };
                
                // Save user with password for local authentication
                registeredUsers.push({
                    ...userResult.user,
                    password: userData.password // Store for demo purposes
                });
                
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                registrationSuccessful = true;
            }

            if (registrationSuccessful) {
                // Registration successful
                // Store user data in localStorage for immediate access
                const userDataToStore = {
                    id: userResult.user.id,
                    username: userResult.user.username,
                    email: userResult.user.email,
                    full_name: userResult.user.full_name,
                    phone: userResult.user.phone,
                    address: userResult.user.address,
                    user_type: userResult.user.user_type,
                    firstName: userResult.user.full_name.split(' ')[0],
                    lastName: userResult.user.full_name.split(' ').slice(1).join(' ')
                };
                
                // Set authentication state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', userResult.user.email);
                localStorage.setItem('userData', JSON.stringify(userDataToStore));
                
                // Initialize empty bookings array for new user
                localStorage.setItem('userBookings', JSON.stringify([]));
                
                alert('Registration successful! Redirecting to your dashboard...');
                window.location.href = '/user-dashboard.html';
            } else {
                throw new Error('Registration failed');
            }

        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}); 