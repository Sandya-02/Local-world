function handleSearch(event) {
    event.preventDefault();
    
    const service = document.getElementById('serviceInput').value.trim();
    const location = document.getElementById('locationInput').value.trim();
    
    if (!service && !location) {
        alert('Please enter a service or location to search');
        return;
    }

    // Store search data in localStorage for maps page
    localStorage.setItem('searchService', service);
    localStorage.setItem('searchLocation', location);
    
    // Navigate to maps page
    window.location.href = 'maps.html';
}

// Add event listeners for search inputs
document.addEventListener('DOMContentLoaded', function() {
    const serviceInput = document.getElementById('serviceInput');
    const locationInput = document.getElementById('locationInput');

    if (serviceInput && locationInput) {
        // Optional: Add autocomplete for services
        serviceInput.addEventListener('input', function() {
            // Add your service suggestion logic here
        });

        // Optional: Add autocomplete for locations
        locationInput.addEventListener('input', function() {
            // Add your location suggestion logic here
        });
    }
}); 