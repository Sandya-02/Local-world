document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AuthManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data from storage
    const userData = AuthManager.getUserData();
    
    if (userData) {
        populateProfileData(userData);
    } else {
        console.error('No user data found');
        // Redirect to login if no data
        window.location.href = 'login.html';
    }
});

function populateProfileData(userData) {
    // Update profile name
    const profileNameElement = document.querySelector('.profile-details h1');
    if (profileNameElement) {
        profileNameElement.textContent = userData.full_name || 'User';
    }

    // Update location/address
    const profileLocationElement = document.querySelector('.profile-details p');
    if (profileLocationElement && userData.address) {
        profileLocationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${userData.address}`;
    }

    // Generate and set initials for avatar
    const initials = userData.full_name
        ? userData.full_name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        : '??';

    const avatar = document.querySelector('.profile-avatar');
    if (avatar) {
        avatar.setAttribute('data-initials', initials);
    }

    // Populate contact information
    updateProfileField('email', userData.email);
    updateProfileField('phone', userData.phone);
    updateProfileField('username', userData.username);
    updateProfileField('address', userData.address);
    updateProfileField('user-type', userData.user_type);

    // If profile has editable fields, populate them
    populateEditableFields(userData);
}

function updateProfileField(fieldId, value) {
    const element = document.getElementById(fieldId) || 
                   document.querySelector(`[data-field="${fieldId}"]`) ||
                   document.querySelector(`.profile-${fieldId}`);
    
    if (element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = value || '';
        } else {
            element.textContent = value || 'Not provided';
        }
    }
}

function populateEditableFields(userData) {
    // Populate form inputs if they exist
    const fields = [
        { id: 'fullName', value: userData.full_name },
        { id: 'email', value: userData.email },
        { id: 'phone', value: userData.phone },
        { id: 'address', value: userData.address },
        { id: 'username', value: userData.username }
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input && field.value) {
            input.value = field.value;
        }
    });
}

// Handle profile update
function updateProfile(formData) {
    const userId = AuthManager.getUserData()?.id;
    
    if (!userId) {
        alert('User not authenticated');
        return;
    }

    // Update localStorage
    const currentData = AuthManager.getUserData();
    const updatedData = { ...currentData, ...formData };
    
    const storage = localStorage.getItem('isLoggedIn') ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(updatedData));

    // Refresh the profile display
    populateProfileData(updatedData);
    
    alert('Profile updated successfully!');
}

// Listen for profile edit form submission
const profileForm = document.getElementById('profileEditForm');
if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            full_name: document.getElementById('fullName')?.value,
            email: document.getElementById('email')?.value,
            phone: document.getElementById('phone')?.value,
            address: document.getElementById('address')?.value
        };
        
        // Get user ID
        const userData = AuthManager.getUserData();
        const userId = userData?.id;
        
        if (!userId) {
            alert('User not logged in');
            return;
        }
        
        try {
            // Call backend API to update user profile
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            
            const result = await response.json();
            
            // Update local profile after successful API call
            updateProfile(formData);
            
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update error:', error);
            // Still update localStorage even if API fails
            updateProfile(formData);
            alert('Profile updated locally. Changes may not be synced to server.');
        }
    });
}

// Export functions
window.ProfileManager = {
    populateProfileData,
    updateProfile
}; 