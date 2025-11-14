// Category Page JavaScript

// All category data
const categoryData = {
    food: [
        {
            id: 1,
            name: "Margherita Pizza",
            category: "food",
            description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
            price: 12.99,
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 156,
            badge: "popular",
            vendor: "Tony's Pizzeria"
        },
        {
            id: 2,
            name: "Chicken Burger",
            category: "food",
            description: "Juicy grilled chicken with lettuce, tomato, and special sauce",
            price: 9.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
            rating: 4.5,
            reviews: 89,
            badge: null,
            vendor: "Burger House"
        },
        {
            id: 3,
            name: "Fresh Smoothie Bowl",
            category: "food",
            description: "Acai bowl topped with fresh fruits, granola, and honey",
            price: 8.50,
            image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 201,
            badge: "popular",
            vendor: "Healthy Bites"
        },
        {
            id: 4,
            name: "Craft Beer",
            category: "drinks",
            description: "Locally brewed IPA with citrus notes and smooth finish",
            price: 6.50,
            image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop",
            rating: 4.6,
            reviews: 78,
            badge: null,
            vendor: "Local Brewery"
        },
        {
            id: 5,
            name: "Fresh Orange Juice",
            category: "drinks",
            description: "100% freshly squeezed orange juice, no sugar added",
            price: 4.99,
            image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 134,
            badge: "new",
            vendor: "Juice Bar"
        },
        {
            id: 6,
            name: "Sushi Platter",
            category: "food",
            description: "Assorted fresh sushi rolls with wasabi and ginger",
            price: 18.99,
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 167,
            badge: "popular",
            vendor: "Sushi Master"
        },
        {
            id: 7,
            name: "Caesar Salad",
            category: "food",
            description: "Crisp romaine lettuce with parmesan, croutons, and Caesar dressing",
            price: 7.99,
            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
            rating: 4.4,
            reviews: 92,
            badge: null,
            vendor: "Fresh Greens"
        },
        {
            id: 8,
            name: "Iced Latte",
            category: "drinks",
            description: "Smooth espresso with cold milk over ice",
            price: 5.50,
            image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 211,
            badge: "popular",
            vendor: "Coffee Corner"
        },
        {
            id: 9,
            name: "Pasta Carbonara",
            category: "food",
            description: "Creamy Italian pasta with bacon, eggs, and parmesan",
            price: 14.99,
            image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 143,
            badge: null,
            vendor: "Italian Kitchen"
        },
        {
            id: 10,
            name: "Bubble Tea",
            category: "drinks",
            description: "Classic milk tea with tapioca pearls and your choice of flavor",
            price: 5.99,
            image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&h=300&fit=crop",
            rating: 4.6,
            reviews: 189,
            badge: "new",
            vendor: "Bubble Tea House"
        },
        {
            id: 11,
            name: "Tacos",
            category: "food",
            description: "Three authentic Mexican tacos with your choice of filling",
            price: 11.99,
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 176,
            badge: "popular",
            vendor: "Taco Fiesta"
        },
        {
            id: 12,
            name: "Mojito",
            category: "drinks",
            description: "Refreshing cocktail with mint, lime, rum, and soda",
            price: 8.99,
            image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 98,
            badge: null,
            vendor: "Cocktail Bar"
        }
    ],
    healthcare: [
        {
            id: 101,
            name: "General Health Checkup",
            category: "general",
            description: "Comprehensive health screening including blood tests, vitals, and consultation",
            price: 89.99,
            image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 234,
            badge: "popular",
            vendor: "City Health Clinic"
        },
        {
            id: 102,
            name: "Dental Cleaning",
            category: "dental",
            description: "Professional teeth cleaning and oral examination",
            price: 75.00,
            image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 189,
            badge: "popular",
            vendor: "Bright Smile Dental"
        },
        {
            id: 103,
            name: "Eye Examination",
            category: "vision",
            description: "Complete eye exam with vision testing and prescription update",
            price: 65.00,
            image: "https://images.unsplash.com/photo-1574854893542-de72f95e8bc8?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 156,
            badge: null,
            vendor: "Vision Care Center"
        },
        {
            id: 104,
            name: "Physical Therapy Session",
            category: "therapy",
            description: "One-on-one physical therapy for injury recovery and pain management",
            price: 95.00,
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 203,
            badge: "popular",
            vendor: "Recovery Plus Physiotherapy"
        },
        {
            id: 105,
            name: "Blood Test Panel",
            category: "laboratory",
            description: "Complete blood count, cholesterol, and metabolic panel testing",
            price: 55.00,
            image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop",
            rating: 4.6,
            reviews: 145,
            badge: null,
            vendor: "LabCare Diagnostics"
        },
        {
            id: 106,
            name: "Vaccination Services",
            category: "preventive",
            description: "Full range of vaccinations including flu, COVID-19, and travel vaccines",
            price: 45.00,
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 312,
            badge: "new",
            vendor: "Community Health Center"
        },
        {
            id: 107,
            name: "Mental Health Counseling",
            category: "mental health",
            description: "Professional counseling session with licensed therapist",
            price: 120.00,
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 178,
            badge: "popular",
            vendor: "Mindful Wellness Clinic"
        },
        {
            id: 108,
            name: "Pediatric Consultation",
            category: "pediatrics",
            description: "Specialized care for children with experienced pediatrician",
            price: 85.00,
            image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 267,
            badge: null,
            vendor: "Kids Care Clinic"
        }
    ],
    education: [
        {
            id: 201,
            name: "Mathematics Tutoring",
            category: "tutoring",
            description: "One-on-one math tutoring for all levels from elementary to advanced calculus",
            price: 45.00,
            image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 198,
            badge: "popular",
            vendor: "Learning Hub"
        },
        {
            id: 202,
            name: "English Language Course",
            category: "language",
            description: "Comprehensive English language training for all proficiency levels",
            price: 299.00,
            image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 234,
            badge: "popular",
            vendor: "Global Language Institute"
        },
        {
            id: 203,
            name: "Piano Lessons",
            category: "music",
            description: "Professional piano instruction for beginners to advanced students",
            price: 60.00,
            image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 156,
            badge: null,
            vendor: "Harmony Music Academy"
        },
        {
            id: 204,
            name: "Computer Programming Bootcamp",
            category: "technology",
            description: "Intensive 12-week bootcamp covering web development and programming",
            price: 1499.00,
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 312,
            badge: "popular",
            vendor: "Tech Skills Academy"
        },
        {
            id: 205,
            name: "Art & Drawing Classes",
            category: "arts",
            description: "Creative art classes covering drawing, painting, and mixed media",
            price: 55.00,
            image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 178,
            badge: "new",
            vendor: "Creative Arts Studio"
        },
        {
            id: 206,
            name: "SAT Preparation Course",
            category: "test prep",
            description: "Complete SAT preparation with practice tests and expert instruction",
            price: 499.00,
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 267,
            badge: "popular",
            vendor: "Ace Test Prep"
        },
        {
            id: 207,
            name: "Yoga & Meditation Classes",
            category: "wellness",
            description: "Mind-body wellness through yoga practice and guided meditation",
            price: 35.00,
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 223,
            badge: null,
            vendor: "Zen Wellness Center"
        },
        {
            id: 208,
            name: "Spanish Language Course",
            category: "language",
            description: "Conversational Spanish course for beginners and intermediate learners",
            price: 250.00,
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 189,
            badge: "new",
            vendor: "Language Masters"
        }
    ],
    home: [
        {
            id: 301,
            name: "House Cleaning Service",
            category: "cleaning",
            description: "Professional deep cleaning for your entire home, eco-friendly products",
            price: 120.00,
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 289,
            badge: "popular",
            vendor: "Sparkle Clean Co."
        },
        {
            id: 302,
            name: "Plumbing Repair",
            category: "plumbing",
            description: "Licensed plumber for leak repairs, installations, and maintenance",
            price: 95.00,
            image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 234,
            badge: "popular",
            vendor: "Quick Fix Plumbing"
        },
        {
            id: 303,
            name: "Electrical Services",
            category: "electrical",
            description: "Certified electrician for wiring, repairs, and installations",
            price: 110.00,
            image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 198,
            badge: null,
            vendor: "Bright Electric"
        },
        {
            id: 304,
            name: "Lawn Care & Landscaping",
            category: "landscaping",
            description: "Complete lawn maintenance including mowing, trimming, and fertilization",
            price: 75.00,
            image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 267,
            badge: "popular",
            vendor: "Green Thumb Landscaping"
        },
        {
            id: 305,
            name: "HVAC Maintenance",
            category: "hvac",
            description: "Heating and cooling system inspection, cleaning, and tune-up",
            price: 135.00,
            image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop",
            rating: 4.9,
            reviews: 312,
            badge: "popular",
            vendor: "Climate Control Experts"
        },
        {
            id: 306,
            name: "Pest Control Service",
            category: "pest control",
            description: "Comprehensive pest elimination and prevention, safe for pets and kids",
            price: 89.00,
            image: "https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=300&fit=crop",
            rating: 4.7,
            reviews: 178,
            badge: null,
            vendor: "Bug-Free Solutions"
        },
        {
            id: 307,
            name: "Painting Services",
            category: "painting",
            description: "Interior and exterior painting with quality materials and finish",
            price: 450.00,
            image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 223,
            badge: "new",
            vendor: "Perfect Paint Pros"
        },
        {
            id: 308,
            name: "Carpentry & Handyman",
            category: "handyman",
            description: "Skilled handyman for furniture assembly, repairs, and installations",
            price: 85.00,
            image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop",
            rating: 4.8,
            reviews: 245,
            badge: null,
            vendor: "Handy Helper Services"
        }
    ]
};

// State management
let currentItems = [];
let allCategoryItems = [];
let categoryType = 'food';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Get category type from URL
    const urlParams = new URLSearchParams(window.location.search);
    categoryType = urlParams.get('type') || 'food';
    
    // Load items for the selected category
    allCategoryItems = categoryData[categoryType] || categoryData.food;
    currentItems = [...allCategoryItems];
    
    // Update page header based on category
    updatePageHeader(categoryType);
    
    // Update filter options based on category
    updateFilterOptions(categoryType);
    
    // Load items
    displayItems(currentItems);
    
    // Setup event listeners
    setupEventListeners();
});

// Update page header based on category type
function updatePageHeader(type) {
    const headers = {
        food: {
            icon: 'fa-utensils',
            title: 'Food & Drinks',
            description: 'Discover delicious food and refreshing drinks from local vendors'
        },
        healthcare: {
            icon: 'fa-heartbeat',
            title: 'Healthcare Services',
            description: 'Find trusted healthcare providers in your area'
        },
        education: {
            icon: 'fa-graduation-cap',
            title: 'Education Centers',
            description: 'Explore learning opportunities and educational institutions'
        },
        home: {
            icon: 'fa-home',
            title: 'Home Services',
            description: 'Connect with reliable home service providers'
        }
    };
    
    const header = headers[type] || headers.food;
    
    document.getElementById('category-name').textContent = header.title;
    document.getElementById('category-title').innerHTML = `<i class="fas ${header.icon} me-3"></i>${header.title}`;
    document.getElementById('category-description').textContent = header.description;
}

// Update filter options based on category
function updateFilterOptions(type) {
    const filterSelect = document.getElementById('filter-select');
    
    const filterOptions = {
        food: `
            <option value="all">All Items</option>
            <option value="food">Food Only</option>
            <option value="drinks">Drinks Only</option>
            <option value="popular">Popular</option>
        `,
        healthcare: `
            <option value="all">All Services</option>
            <option value="general">General Care</option>
            <option value="dental">Dental</option>
            <option value="vision">Vision</option>
            <option value="therapy">Therapy</option>
            <option value="popular">Popular</option>
        `,
        education: `
            <option value="all">All Courses</option>
            <option value="tutoring">Tutoring</option>
            <option value="language">Language</option>
            <option value="music">Music</option>
            <option value="technology">Technology</option>
            <option value="popular">Popular</option>
        `,
        home: `
            <option value="all">All Services</option>
            <option value="cleaning">Cleaning</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="landscaping">Landscaping</option>
            <option value="popular">Popular</option>
        `
    };
    
    filterSelect.innerHTML = filterOptions[type] || filterOptions.food;
}

// Display items in grid
function displayItems(items) {
    const grid = document.getElementById('items-grid');
    const itemCount = document.getElementById('item-count');
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No items found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            </div>
        `;
        itemCount.textContent = '0 items';
        return;
    }
    
    itemCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
    
    // Determine button text based on category type
    const buttonConfig = {
        food: { text: 'Order Now', icon: 'fa-shopping-cart' },
        healthcare: { text: 'Book Now', icon: 'fa-calendar-check' },
        education: { text: 'Enroll Now', icon: 'fa-user-plus' },
        home: { text: 'Book Service', icon: 'fa-calendar-check' }
    };
    
    const btnConfig = buttonConfig[categoryType] || buttonConfig.food;
    
    grid.innerHTML = items.map(item => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="item-card">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}'">
                    ${item.badge ? `<span class="item-badge ${item.badge}">${item.badge}</span>` : ''}
                </div>
                <div class="item-body">
                    <div class="item-category">${item.category}</div>
                    <h3 class="item-title">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                    <div class="item-rating">
                        <span class="stars">
                            ${generateStars(item.rating)}
                        </span>
                        <span class="rating-text">${item.rating} (${item.reviews} reviews)</span>
                    </div>
                    <div class="item-footer">
                        <div>
                            <span class="item-price-label">Price</span>
                            <div class="item-price">$${item.price.toFixed(2)}</div>
                        </div>
                        <button class="btn btn-order" onclick="orderItem(${item.id})">
                            <i class="fas ${btnConfig.icon} me-2"></i>${btnConfig.text}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(filterItems, 300));
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', sortItems);
    
    // Filter functionality
    const filterSelect = document.getElementById('filter-select');
    filterSelect.addEventListener('change', filterItems);
}

// Filter items based on search and filter selections
function filterItems() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterType = document.getElementById('filter-select').value;
    
    let filtered = [...allCategoryItems];
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.vendor.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (filterType !== 'all') {
        if (filterType === 'popular') {
            filtered = filtered.filter(item => item.badge === 'popular');
        } else {
            filtered = filtered.filter(item => item.category === filterType);
        }
    }
    
    currentItems = filtered;
    sortItems();
}

// Sort items
function sortItems() {
    const sortType = document.getElementById('sort-select').value;
    
    switch (sortType) {
        case 'name':
            currentItems.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            currentItems.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            currentItems.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            currentItems.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    displayItems(currentItems);
}

// Order item - navigate to order form
function orderItem(itemId) {
    // Find item across all categories
    let item = null;
    for (const category in categoryData) {
        item = categoryData[category].find(i => i.id === itemId);
        if (item) break;
    }
    
    if (item) {
        // Store item data in sessionStorage for order form
        sessionStorage.setItem('orderItem', JSON.stringify(item));
        // Redirect to order form
        window.location.href = 'order-form.html';
    }
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update location function
function updateLocation() {
    const newLocation = prompt('Enter your location:', document.getElementById('current-location').textContent);
    if (newLocation) {
        document.getElementById('current-location').textContent = newLocation;
    }
}
