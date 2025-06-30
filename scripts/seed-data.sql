-- Insert sample categories
INSERT INTO categories (name) VALUES 
('Electronics'),
('Clothing & Accessories'),
('Documents & Cards'),
('Jewelry & Watches'),
('Bags & Luggage'),
('Sports & Recreation'),
('Pets'),
('Vehicles'),
('Books & Media'),
('Other');

-- Insert sample subcategories
INSERT INTO subcategories (name, category_id) VALUES 
-- Electronics
('Mobile Phones', 1),
('Laptops & Tablets', 1),
('Headphones & Audio', 1),
('Cameras', 1),
('Gaming Devices', 1),

-- Clothing & Accessories
('Clothing', 2),
('Shoes', 2),
('Accessories', 2),
('Eyewear', 2),

-- Documents & Cards
('ID Documents', 3),
('Credit Cards', 3),
('Keys', 3),
('Certificates', 3),

-- Jewelry & Watches
('Rings', 4),
('Necklaces', 4),
('Watches', 4),
('Earrings', 4),

-- Bags & Luggage
('Backpacks', 5),
('Handbags', 5),
('Suitcases', 5),
('Wallets', 5);

-- Insert sample models
INSERT INTO models (name, subcategory_id) VALUES 
-- Mobile Phones
('iPhone 15', 1),
('iPhone 14', 1),
('Samsung Galaxy S24', 1),
('Google Pixel 8', 1),

-- Laptops & Tablets
('MacBook Pro', 2),
('MacBook Air', 2),
('iPad Pro', 2),
('Surface Pro', 2),

-- Headphones & Audio
('AirPods Pro', 3),
('Sony WH-1000XM5', 3),
('Bose QuietComfort', 3);

-- Insert sample cities
INSERT INTO cities (name) VALUES 
('New York'),
('Los Angeles'),
('Chicago'),
('Houston'),
('Phoenix'),
('Philadelphia'),
('San Antonio'),
('San Diego'),
('Dallas'),
('San Jose'),
('Austin'),
('Jacksonville'),
('Fort Worth'),
('Columbus'),
('Charlotte');

-- Insert sample items
INSERT INTO items (title, description, category_id, subcategory_id, model_id, city_id, location, date_lost, contact_info, status) VALUES 
('Lost iPhone 15 Pro', 'Black iPhone 15 Pro with cracked screen protector. Lost at Central Park near the lake.', 1, 1, 1, 1, 'Central Park, near the lake', '2024-01-15', 'john@email.com', 'active'),
('Missing MacBook Pro', 'Silver MacBook Pro 16-inch. Left in coffee shop on 5th Avenue.', 1, 2, 5, 1, 'Coffee shop on 5th Avenue', '2024-01-10', 'sarah@email.com', 'active'),
('Lost AirPods Pro', 'White AirPods Pro in charging case. Dropped somewhere in Times Square.', 1, 3, 9, 1, 'Times Square area', '2024-01-12', 'mike@email.com', 'active'),
('Missing Black Backpack', 'Black leather backpack with laptop inside. Lost on subway Line 6.', 5, 9, NULL, 1, 'Subway Line 6', '2024-01-08', 'lisa@email.com', 'active'),
('Lost Wedding Ring', 'Gold wedding band with engraving "Forever & Always". Lost at the gym.', 4, 5, NULL, 2, 'LA Fitness Downtown', '2024-01-05', 'david@email.com', 'active');
