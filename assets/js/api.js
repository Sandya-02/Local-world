// API Service for LocalFinder
const API = {
    // Base API URL - change this for production
    baseURL: 'https://api.localfinder.com/v1',
    
    // Request headers
    headers: {
        'Content-Type': 'application/json',
    },

    // Authentication Methods
    auth: {
        async login(email, password) {
            try {
                const response = await API.post('/auth/login', { email, password });
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    API.headers['Authorization'] = `Bearer ${response.token}`;
                }
                return response;
            } catch (error) {
                throw new Error('Login failed: ' + error.message);
            }
        },

        async register(userData) {
            try {
                return await API.post('/auth/register', userData);
            } catch (error) {
                throw new Error('Registration failed: ' + error.message);
            }
        },

        async logout() {
            localStorage.removeItem('token');
            delete API.headers['Authorization'];
            return true;
        },

        isAuthenticated() {
            return !!localStorage.getItem('token');
        }
    },

    // Business Methods
    businesses: {
        async search(params) {
            try {
                const queryString = new URLSearchParams(params).toString();
                return await API.get(`/businesses/search?${queryString}`);
            } catch (error) {
                throw new Error('Search failed: ' + error.message);
            }
        },

        async getById(id) {
            try {
                return await API.get(`/businesses/${id}`);
            } catch (error) {
                throw new Error('Failed to fetch business: ' + error.message);
            }
        },

        async create(businessData) {
            try {
                return await API.post('/businesses', businessData);
            } catch (error) {
                throw new Error('Failed to create business: ' + error.message);
            }
        },

        async update(id, businessData) {
            try {
                return await API.put(`/businesses/${id}`, businessData);
            } catch (error) {
                throw new Error('Failed to update business: ' + error.message);
            }
        }
    },

    // Booking Methods
    bookings: {
        async create(bookingData) {
            try {
                return await API.post('/bookings', bookingData);
            } catch (error) {
                throw new Error('Booking failed: ' + error.message);
            }
        },

        async getByUser() {
            try {
                return await API.get('/bookings/user');
            } catch (error) {
                throw new Error('Failed to fetch bookings: ' + error.message);
            }
        },

        async cancel(id) {
            try {
                return await API.put(`/bookings/${id}/cancel`);
            } catch (error) {
                throw new Error('Failed to cancel booking: ' + error.message);
            }
        }
    },

    // Chat Methods
    chat: {
        async getConversations() {
            try {
                return await API.get('/chat/conversations');
            } catch (error) {
                throw new Error('Failed to fetch conversations: ' + error.message);
            }
        },

        async getMessages(conversationId) {
            try {
                return await API.get(`/chat/conversations/${conversationId}/messages`);
            } catch (error) {
                throw new Error('Failed to fetch messages: ' + error.message);
            }
        },

        async sendMessage(conversationId, message) {
            try {
                return await API.post(`/chat/conversations/${conversationId}/messages`, { message });
            } catch (error) {
                throw new Error('Failed to send message: ' + error.message);
            }
        }
    },

    // Review Methods
    reviews: {
        async create(businessId, reviewData) {
            try {
                return await API.post(`/businesses/${businessId}/reviews`, reviewData);
            } catch (error) {
                throw new Error('Failed to create review: ' + error.message);
            }
        },

        async getForBusiness(businessId) {
            try {
                return await API.get(`/businesses/${businessId}/reviews`);
            } catch (error) {
                throw new Error('Failed to fetch reviews: ' + error.message);
            }
        }
    },

    // Base HTTP Methods
    async get(endpoint) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'GET',
                headers: this.headers
            });
            return this.handleResponse(response);
        } catch (error) {
            throw new Error(`GET request failed: ${error.message}`);
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            throw new Error(`POST request failed: ${error.message}`);
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            throw new Error(`PUT request failed: ${error.message}`);
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'DELETE',
                headers: this.headers
            });
            return this.handleResponse(response);
        } catch (error) {
            throw new Error(`DELETE request failed: ${error.message}`);
        }
    },

    // Response Handler
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                // Handle unauthorized access
                this.auth.logout();
                window.location.href = '/login.html';
            }
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    },

    // Error Handler
    handleError(error) {
        console.error('API Error:', error);
        LocalFinder.showAlert(error.message, 'error');
        throw error;
    }
};

// Initialize token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
    API.headers['Authorization'] = `Bearer ${token}`;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
} 