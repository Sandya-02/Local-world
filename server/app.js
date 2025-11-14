class ChatBot {
    constructor() {
        this.API_URL = 'http://localhost:3000/api/chat'; // Update with your server URL
        this.messageInput = document.querySelector('.chat-input input');
        this.sendButton = document.querySelector('.chat-input .btn-primary');
        this.chatMessages = document.querySelector('.chat-messages');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'sent');
        this.messageInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            // Remove typing indicator and add AI response
            this.removeTypingIndicator();
            this.addMessageToChat(response, 'received');
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessageToChat('Sorry, I encountered an error. Please try again.', 'received');
        }
    }

    async getAIResponse(message) {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data.response;
        } catch (error) {
            throw new Error('Failed to get AI response');
        }
    }

    // ... rest of the ChatBot class methods remain the same ...
} 