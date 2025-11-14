let map;
let markers = [];
let currentLocation;

// Initialize map
function initMap() {
    try {
        // Create map centered on default location
        map = L.map('map', {
            minZoom: 2,
            maxZoom: 18
        }).setView([40.7128, -74.0060], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Check for search parameters
        const searchParams = new URLSearchParams(window.location.search);
        const searchLocation = searchParams.get('location');
        const searchService = searchParams.get('service');

        if (searchLocation) {
            document.getElementById('search-input').value = searchLocation;
            handleSearch(searchService);
        } else {
            getUserLocation();
        }

        // Initialize distance slider if it exists
        const distanceSlider = document.getElementById('distance');
        const distanceValue = document.getElementById('distance-value');
        if (distanceSlider && distanceValue) {
            distanceSlider.addEventListener('input', (e) => {
                distanceValue.textContent = `${e.target.value} km`;
            });
        }

    } catch (error) {
        console.error('Map initialization error:', error);
        alert('Error initializing map. Please refresh the page.');
    }
}

// Get user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setView([currentLocation.lat, currentLocation.lng], 13);
                addMarker([currentLocation.lat, currentLocation.lng], 'Your Location', 'current-location');
                searchNearbyServices(currentLocation);
            },
            error => {
                console.warn('Geolocation error:', error);
                // Default to New York if location access is denied
                const defaultLocation = { lat: 40.7128, lng: -74.0060 };
                map.setView([defaultLocation.lat, defaultLocation.lng], 13);
                searchNearbyServices(defaultLocation);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Handle search
async function handleSearch() {
    const searchInput = document.getElementById('search-input').value.trim();
    if (!searchInput) {
        alert('Please enter a location to search');
        return;
    }

    try {
        document.getElementById('results-list').innerHTML = '<div class="p-3">Searching...</div>';

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=1`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data && data.length > 0) {
            const location = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                name: data[0].display_name
            };

            clearMarkers();
            map.setView([location.lat, location.lng], 13);
            addMarker([location.lat, location.lng], location.name, 'search-result');
            searchNearbyServices(location);
        } else {
            document.getElementById('results-list').innerHTML = 
                '<div class="p-3">No results found. Please try a different location.</div>';
        }
    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('results-list').innerHTML = 
            '<div class="p-3 text-danger">Error searching location. Please try again.</div>';
    }
}

// Search for nearby services
async function searchNearbyServices(location) {
    try {
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '<div class="p-3">Searching for services...</div>';

        const serviceType = document.getElementById('service-type')?.value;
        const distance = document.getElementById('distance')?.value || 10;

        // Mock service data - replace with actual API call
        const services = [
            {
                id: 1,
                name: "John's Plumbing",
                type: "plumbing",
                rating: 4.5,
                location: {
                    lat: location.lat + 0.01,
                    lng: location.lng + 0.01
                },
                address: "123 Main St",
                phone: "(555) 123-4567"
            },
            {
                id: 2,
                name: "Elite Electricals",
                type: "electrical",
                rating: 4.8,
                location: {
                    lat: location.lat - 0.01,
                    lng: location.lng - 0.01
                },
                address: "456 Park Ave",
                phone: "(555) 234-5678"
            },
            {
                id: 3,
                name: "Clean & Clear",
                type: "cleaning",
                rating: 4.2,
                location: {
                    lat: location.lat + 0.02,
                    lng: location.lng - 0.02
                },
                address: "789 Broadway",
                phone: "(555) 345-6789"
            }
        ];

        // Filter services based on type if specified
        const filteredServices = serviceType 
            ? services.filter(s => s.type.toLowerCase() === serviceType.toLowerCase())
            : services;

        displayResults(filteredServices, location);
    } catch (error) {
        console.error('Error searching services:', error);
        document.getElementById('results-list').innerHTML = 
            '<div class="p-3 text-danger">Error loading services. Please try again.</div>';
    }
}

// Display results in sidebar
function displayResults(services, searchLocation) {
    const resultsList = document.getElementById('results-list');
    
    if (services.length === 0) {
        resultsList.innerHTML = '<div class="p-3">No services found in this area.</div>';
        return;
    }

    resultsList.innerHTML = services.map(service => {
        const distance = calculateDistance(
            searchLocation.lat,
            searchLocation.lng,
            service.location.lat,
            service.location.lng
        );

        return `
            <div class="list-group-item" onclick="showServiceDetails(${service.id})">
                <h6>${service.name}</h6>
                <p class="mb-1">
                    <span class="badge bg-secondary">${service.type}</span>
                    <small class="ms-2">${distance.toFixed(1)} km away</small>
                </p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-warning">
                        ${'★'.repeat(Math.floor(service.rating))}
                        ${service.rating % 1 ? '½' : ''}
                        ${'☆'.repeat(5 - Math.ceil(service.rating))}
                    </small>
                    <button class="btn btn-sm btn-outline-primary">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add markers for services
    services.forEach(service => {
        addMarker(
            [service.location.lat, service.location.lng],
            service.name,
            'service'
        );
    });
}

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI/180);
}

// Add marker to map
function addMarker(location, title, type) {
    const markerOptions = {
        title: title
    };

    if (type === 'current-location') {
        markerOptions.icon = L.divIcon({
            className: 'current-location-marker',
            html: '<i class="fas fa-dot-circle"></i>'
        });
    }

    const marker = L.marker([location[0], location[1]], markerOptions)
        .bindPopup(title)
        .addTo(map);
    
    markers.push(marker);
}

// Clear existing markers
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Show service details
function showServiceDetails(serviceId) {
    // Implement service details display
    console.log('Showing details for service:', serviceId);
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap); 