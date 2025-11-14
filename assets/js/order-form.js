// Order Form JavaScript

// Constants
const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.10; // 10%

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
    document.getElementById('item-price').textContent = `$${orderItem.price.toFixed(2)}`;
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
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
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
        // Simulate API call (replace with actual API endpoint)
        await simulateOrderSubmission(orderData);
        
        // Generate order number
        const orderNumber = generateOrderNumber();
        document.getElementById('order-number').textContent = orderNumber;
        
        // Store order in localStorage for user dashboard
        saveOrderToLocalStorage(orderData, orderNumber);
        
        // Clear session storage
        sessionStorage.removeItem('orderItem');
        
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.error('Order submission error:', error);
        alert('There was an error processing your order. Please try again.');
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Simulate order submission (replace with actual API call)
function simulateOrderSubmission(orderData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Order submitted:', orderData);
            resolve({ success: true });
        }, 2000);
    });
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

// Uncomment to enable demo data auto-fill
// window.addEventListener('load', () => setTimeout(fillDemoData, 500));
