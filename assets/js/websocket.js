// WebSocket Service for LocalFinder
const WebSocketService = {
    // WebSocket connection
    socket: null,
    
    // Connection status
    isConnected: false,
    
    // Reconnection settings
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
    
    // Message handlers
    handlers: new Map(),
    
    // Initialize WebSocket connection
    init() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found');
            return;
        }

        const wsUrl = 'wss://api.localfinder.com/ws';
        this.connect(wsUrl, token);
        this.setupEventListeners();
    },

    // Establish WebSocket connection
    connect(url, token) {
        try {
            this.socket = new WebSocket(`${url}?token=${token}`);
            this.setupSocketHandlers();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnection();
        }
    },

    // Setup WebSocket event handlers
    setupSocketHandlers() {
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connection_status', { connected: true });
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            this.handleReconnection();
            this.emit('connection_status', { connected: false });
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', { message: 'Connection error occurred' });
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
    },

    // Handle incoming messages
    handleMessage(data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'chat_message':
                this.emit('chat_message', payload);
                this.handleChatNotification(payload);
                break;
                
            case 'booking_update':
                this.emit('booking_update', payload);
                this.handleBookingNotification(payload);
                break;
                
            case 'user_typing':
                this.emit('user_typing', payload);
                break;
                
            case 'notification':
                this.emit('notification', payload);
                this.handleSystemNotification(payload);
                break;
                
            default:
                console.warn('Unknown message type:', type);
        }
    },

    // Send message to WebSocket server
    send(type, payload) {
        if (!this.isConnected) {
            console.warn('WebSocket is not connected');
            return false;
        }

        try {
            const message = JSON.stringify({ type, payload });
            this.socket.send(message);
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    },

    // Register event handler
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
    },

    // Remove event handler
    off(event, handler) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    },

    // Emit event to registered handlers
    emit(event, data) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error);
                }
            });
        }
    },

    // Handle reconnection attempts
    handleReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('connection_error', { 
                message: 'Unable to establish connection' 
            });
            return;
        }

        this.reconnectAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.init();
            }
        }, this.reconnectDelay * this.reconnectAttempts);
    },

    // Chat-specific methods
    sendChatMessage(conversationId, message) {
        return this.send('chat_message', {
            conversation_id: conversationId,
            message,
            timestamp: new Date().toISOString()
        });
    },

    sendTypingStatus(conversationId, isTyping) {
        return this.send('user_typing', {
            conversation_id: conversationId,
            is_typing: isTyping
        });
    },

    // Notification handlers
    handleChatNotification(payload) {
        const { sender, message } = payload;
        LocalFinder.showAlert(`New message from ${sender}: ${message}`, 'info');
    },

    handleBookingNotification(payload) {
        const { status, business_name } = payload;
        LocalFinder.showAlert(
            `Booking ${status} for ${business_name}`,
            status === 'confirmed' ? 'success' : 'info'
        );
    },

    handleSystemNotification(payload) {
        const { message, type } = payload;
        LocalFinder.showAlert(message, type || 'info');
    },

    // Cleanup method
    cleanup() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.handlers.clear();
        this.isConnected = false;
        this.reconnectAttempts = 0;
    }
};

// Initialize WebSocket when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    WebSocketService.init();
});

// Cleanup on page unload
window.addEventListener('unload', () => {
    WebSocketService.cleanup();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketService;
} 