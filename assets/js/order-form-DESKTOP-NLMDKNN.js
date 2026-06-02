// Order Form JavaScript

// Constants - Indian Rupees
const DELIVERY_FEE = 50; // ₹50 delivery fee
const TAX_RATE = 0.18; // 18% GST (Indian tax)

// State
let orderItem = null;
let quantity = 1;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Load item from sessionStorage
    loadOrderItem();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize calculations
    updateOrderSummary();
});

// Load order item from sessionStorage
function loadOrderItem() {
    const itemData = sessionStorage.getItem('orderItem');
    
    if (!itemData) {
        // No item selected, redirect back
        alert('No item selected. Please select an item from the category page.');
        window.location.href = 'category.html?type=food';
        return;
    }
    
    try {
        orderItem = JSON.parse(itemData);
        displayItemPreview();
    } catch (error) {
        console.error('Error loading order item:', error);
        alert('Error loading item details. Please try again.');
        window.location.href = 'category.html?type=food';
    }
}

// Display item preview in summary
function displayItemPreview() {
    if (!orderItem) return;
    
    document.getElementById('preview-image').src = orderItem.image;
    document.getElementById('preview-image').alt = orderItem.name;
    document.getElementById('preview-name').textContent = orderItem.name;
    document.getElementById('preview-vendor').textContent = orderItem.vendor;
    document.getElementById('item-price').textContent = `₹${orderItem.price.toFixed(2)}`;
}

// Setup event listeners
function setupEventListeners() {
    // Quantity change
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('change', function() {
        quantity = parseInt(this.value) || 1;
        if (quantity < 1) quantity = 1;
        if (quantity > 99) quantity = 99;
        this.value = quantity;
        updateOrderSummary();
    });
    
    // Form submission
    const form = document.getElementById('order-form');
    form.addEventListener('submit', handleOrderSubmit);
    
    // Real-time validation
    setupFormValidation();
}

// Setup real-time form validation
function setupFormValidation() {
    const form = document.getElementById('order-form');
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 10) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Update field state
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        removeErrorMessage(field);
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        showErrorMessage(field, errorMessage);
    }
    
    return isValid;
}

// Show error message
function showErrorMessage(field, message) {
    removeErrorMessage(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Remove error message
function removeErrorMessage(field) {
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

// Increase quantity
function increaseQuantity() {
    quantity++;
    if (quantity > 99) quantity = 99;
    document.getElementById('quantity').value = quantity;
    updateOrderSummary();
}

// Decrease quantity
function decreaseQuantity() {
    quantity--;
    if (quantity < 1) quantity = 1;
    document.getElementById('quantity').value = quantity;
    updateOrderSummary();
}

// Update order summary calculations
function updateOrderSummary() {
    if (!orderItem) return;
    
    const itemPrice = orderItem.price;
    const subtotal = itemPrice * quantity;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + DELIVERY_FEE + tax;
    
    document.getElementById('summary-quantity').textContent = quantity;
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
}

// Handle order submission
async function handleOrderSubmit(event) {
    event.preventDefault();
    
    // Validate all fields
    const form = event.target;
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    let isFormValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    // Check terms acceptance
    const termsAccept = document.getElementById('termsAccept');
    if (!termsAccept.checked) {
        isFormValid = false;
        alert('Please accept the Terms and Conditions to proceed.');
        termsAccept.focus();
        return;
    }
    
    if (!isFormValid) {
        alert('Please fill in all required fields correctly.');
        return;
    }
    
    // Collect form data
    const orderData = {
        item: orderItem,
        quantity: quantity,
        customer: {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim()
        },
        deliveryTime: document.getElementById('deliveryTime').value,
        specialInstructions: document.getElementById('specialInstructions').value.trim(),
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        pricing: {
            itemPrice: orderItem.price,
            quantity: quantity,
            subtotal: orderItem.price * quantity,
            deliveryFee: DELIVERY_FEE,
            tax: (orderItem.price * quantity) * TAX_RATE,
            total: (orderItem.price * quantity) + DELIVERY_FEE + ((orderItem.price * quantity) * TAX_RATE)
        },
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    
    try {
        // Call backend API to create booking
        const result = await simulateOrderSubmission(orderData);
        
        // Generate order number
        const orderNumber = generateOrderNumber();
        document.getElementById('order-number').textContent = orderNumber;
        
        // Store order in localStorage for user dashboard
        saveOrderToLocalStorage(orderData, orderNumber);
        
        // Clear session storage
        sessionStorage.removeItem('orderItem');
        
        // Show success notification
        showNotification('success', '✅ Order Confirmed!', `Your order has been placed successfully. Order Number: ${orderNumber}. Status: Pending`);
        
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Reset form
        form.reset();
        
        // Reload bookings if on bookings page
        if (typeof loadUserBookings === 'function') {
            setTimeout(() => loadUserBookings(), 1000);
        }
        
    } catch (error) {
        console.error('Order submission error:', error);
        
        // Show error notification based on error type
        if (error.message.includes('not logged in')) {
            showNotification('error', '❌ Login Required', 'Please login to place an order.');
        } else if (error.message.includes('not available')) {
            showNotification('warning', '⚠️ Item Not Available', 'The item you selected is currently not available. Please try another item.');
        } else {
            showNotification('error', '❌ Order Failed', error.message || 'There was an error processing your order. Please try again.');
        }
        
        alert('Order Error: ' + error.message);
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Submit order to backend API
async function simulateOrderSubmission(orderData) {
    try {
        // Get user data to extract user_id
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userId = userData.id;
        
        if (!userId) {
            throw new Error('User not logged in');
        }
        
        // Prepare booking data for backend with complete order details
        const bookingData = {
            user_id: userId,
            service_id: orderItem.id || 1, // Use actual service ID from orderItem
            booking_date: orderData.deliveryTime || new Date().toISOString().split('T')[0],
            booking_time: '10:00:00', // You can add time selection in the form
            status: 'pending',
            notes: `Order: ${orderItem.name} x${quantity} | Address: ${orderData.customer.address} | Special Instructions: ${orderData.specialInstructions || 'None'} | Total: ₹${orderData.pricing.total.toFixed(2)}`
        };
        
        console.log('Submitting booking:', bookingData);
        
        // Call backend API
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create booking');
        }
        
        const result = await response.json();
        console.log('✅ Booking created successfully in database:', result);
        
        // Show success alert
        alert(`✅ Order Confirmed!\n\nYour order for ${orderItem.name} has been placed successfully.\n\nStatus: Pending\nTotal: ₹${orderData.pricing.total.toFixed(2)}\n\nYou can view your order in the Bookings page.`);
        
        return result;
    } catch (error) {
        console.error('❌ Order submission error:', error);
        throw error;
    }
}

// Generate order number
function generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
}

// Save order to localStorage
function saveOrderToLocalStorage(orderData, orderNumber) {
    try {
        // Get existing orders
        const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        
        // Add new order
        const newOrder = {
            ...orderData,
            orderNumber: orderNumber
        };
        
        existingOrders.push(newOrder);
        
        // Save back to localStorage
        localStorage.setItem('userOrders', JSON.stringify(existingOrders));
    } catch (error) {
        console.error('Error saving order to localStorage:', error);
    }
}

// Utility function to format currency
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

// Auto-fill demo data (for testing - remove in production)
function fillDemoData() {
    document.getElementById('firstName').value = 'John';
    document.getElementById('lastName').value = 'Doe';
    document.getElementById('email').value = 'john.doe@example.com';
    document.getElementById('phone').value = '+1 234 567 8900';
    document.getElementById('address').value = '123 Main Street, Springfield, IL 62701';
}

// Show notification function
function showNotification(type, title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    notification.innerHTML = `
        <strong>${title}</strong><br>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Also show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/favicon.ico' });
    }
}

// Uncomment to enable demo data auto-fill
// window.addEventListener('load', () => setTimeout(fillDemoData, 500));
