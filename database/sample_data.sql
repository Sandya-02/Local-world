-- Sample Data for LocalFinder Database
-- This file contains sample data to test the database tables

-- Insert sample users (passwords are hashed for 'password123')
INSERT INTO users (username, email, password, full_name, phone, address, user_type) VALUES
('john_doe', 'john@example.com', '$2a$10$rZ3QKhRpZEKLvhYzWqx.VeXZSEZvYWYxYaZQKhRpZEKLvhYzWqx.Ve', 'John Doe', '555-0101', '123 Main St, City, State', 'user'),
('jane_smith', 'jane@example.com', '$2a$10$rZ3QKhRpZEKLvhYzWqx.VeXZSEZvYWYxYaZQKhRpZEKLvhYzWqx.Ve', 'Jane Smith', '555-0102', '456 Oak Ave, City, State', 'user'),
('mike_seller', 'mike@business.com', '$2a$10$rZ3QKhRpZEKLvhYzWqx.VeXZSEZvYWYxYaZQKhRpZEKLvhYzWqx.Ve', 'Mike Johnson', '555-0103', '789 Business Blvd, City, State', 'seller'),
('sarah_seller', 'sarah@cleanpro.com', '$2a$10$rZ3QKhRpZEKLvhYzWqx.VeXZSEZvYWYxYaZQKhRpZEKLvhYzWqx.Ve', 'Sarah Williams', '555-0104', '321 Service Lane, City, State', 'seller'),
('bob_seller', 'bob@techrepair.com', '$2a$10$rZ3QKhRpZEKLvhYzWqx.VeXZSEZvYWYxYaZQKhRpZEKLvhYzWqx.Ve', 'Bob Anderson', '555-0105', '654 Tech Street, City, State', 'seller');

-- Insert sample sellers
INSERT INTO sellers (user_id, business_name, business_type, description, address, phone, email, website, operating_hours) VALUES
(3, 'Mike\'s Plumbing Services', 'Plumbing', 'Professional plumbing services for residential and commercial properties. 24/7 emergency services available.', '789 Business Blvd, City, State', '555-0103', 'mike@business.com', 'www.mikesplumbing.com', '{"Monday":"8:00 AM - 6:00 PM","Tuesday":"8:00 AM - 6:00 PM","Wednesday":"8:00 AM - 6:00 PM","Thursday":"8:00 AM - 6:00 PM","Friday":"8:00 AM - 6:00 PM","Saturday":"9:00 AM - 4:00 PM","Sunday":"Closed"}'),
(4, 'CleanPro House Cleaning', 'Cleaning', 'Expert house cleaning services. Weekly, bi-weekly, and monthly plans available.', '321 Service Lane, City, State', '555-0104', 'sarah@cleanpro.com', 'www.cleanpro.com', '{"Monday":"7:00 AM - 7:00 PM","Tuesday":"7:00 AM - 7:00 PM","Wednesday":"7:00 AM - 7:00 PM","Thursday":"7:00 AM - 7:00 PM","Friday":"7:00 AM - 7:00 PM","Saturday":"8:00 AM - 5:00 PM","Sunday":"Closed"}'),
(5, 'Tech Repair Hub', 'Electronics Repair', 'Computer and electronics repair services. Fast turnaround time guaranteed.', '654 Tech Street, City, State', '555-0105', 'bob@techrepair.com', 'www.techrepairhub.com', '{"Monday":"9:00 AM - 8:00 PM","Tuesday":"9:00 AM - 8:00 PM","Wednesday":"9:00 AM - 8:00 PM","Thursday":"9:00 AM - 8:00 PM","Friday":"9:00 AM - 8:00 PM","Saturday":"10:00 AM - 6:00 PM","Sunday":"12:00 PM - 5:00 PM"}');

-- Insert sample services
INSERT INTO services (seller_id, name, category, description, price_range) VALUES
(1, 'Emergency Plumbing Repair', 'Plumbing', 'Fast response emergency plumbing repairs for all types of issues.', '$80-$150/hr'),
(1, 'Bathroom Installation', 'Plumbing', 'Complete bathroom installation and renovation services.', '$2000-$5000'),
(1, 'Drain Cleaning', 'Plumbing', 'Professional drain cleaning and unclogging services.', '$100-$200'),
(2, 'Deep House Cleaning', 'Cleaning', 'Thorough deep cleaning of entire house including hard-to-reach areas.', '$150-$300'),
(2, 'Regular Weekly Cleaning', 'Cleaning', 'Weekly maintenance cleaning service for busy families.', '$80-$120/week'),
(2, 'Move-in/Move-out Cleaning', 'Cleaning', 'Complete cleaning for moving in or out of a property.', '$200-$400'),
(3, 'Computer Repair', 'Electronics', 'Diagnosis and repair of desktop and laptop computers.', '$50-$150'),
(3, 'Phone Screen Replacement', 'Electronics', 'Screen replacement for all major phone brands.', '$50-$200'),
(3, 'Data Recovery', 'Electronics', 'Professional data recovery from damaged devices.', '$100-$500');

-- Insert sample bookings
INSERT INTO bookings (user_id, service_id, booking_date, booking_time, status, notes) VALUES
(1, 1, '2026-01-10', '10:00:00', 'confirmed', 'Kitchen sink is leaking badly'),
(1, 4, '2026-01-15', '09:00:00', 'pending', 'Need deep cleaning before guests arrive'),
(2, 7, '2026-01-08', '14:00:00', 'confirmed', 'Laptop not turning on'),
(2, 5, '2026-01-12', '08:00:00', 'confirmed', 'Weekly cleaning service'),
(1, 8, '2026-01-20', '11:00:00', 'pending', 'iPhone screen cracked');

-- Insert sample reviews
INSERT INTO reviews (user_id, seller_id, rating, comment) VALUES
(1, 1, 5, 'Excellent service! Mike was professional and fixed my plumbing issue quickly.'),
(2, 3, 5, 'Very knowledgeable and fixed my laptop in no time. Highly recommended!'),
(1, 2, 4, 'Good cleaning service, but arrived 15 minutes late. Otherwise very thorough.'),
(2, 1, 5, 'Emergency service was fantastic. Available when I needed help most.');

-- Insert sample favorites
INSERT INTO favorites (user_id, seller_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 1);

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message) VALUES
(1, 'booking', 'Booking Confirmed', 'Your booking for Emergency Plumbing Repair has been confirmed for Jan 10, 2026 at 10:00 AM'),
(2, 'booking', 'Booking Confirmed', 'Your booking for Computer Repair has been confirmed for Jan 8, 2026 at 2:00 PM'),
(1, 'reminder', 'Upcoming Booking', 'Reminder: You have a booking tomorrow for Deep House Cleaning at 9:00 AM'),
(3, 'review', 'New Review', 'John Doe left a 5-star review for your service');
