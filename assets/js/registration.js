document.getElementById('sellerRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        business_name: document.getElementById('businessName').value,
        business_type: document.getElementById('businessType').value,
        description: document.getElementById('description').value,
        business_address: document.getElementById('businessAddress').value,
        business_phone: document.getElementById('businessPhone').value,
        business_email: document.getElementById('businessEmail').value,
        website: document.getElementById('website').value,
        operating_hours: document.getElementById('operatingHours').value
    };

    try {
        const response = await fetch('/api/register/seller', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Business registered successfully!');
            window.location.href = '/dashboard.html';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error registering business: ' + error.message);
    }
}); 