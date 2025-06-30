-- Sample data for your existing tables

-- Insert sample cities
INSERT INTO ville (ville) VALUES 
('Paris'),
('Lyon'),
('Marseille'),
('Toulouse'),
('Nice'),
('Nantes'),
('Strasbourg'),
('Montpellier'),
('Bordeaux'),
('Lille');

-- Insert sample categories
INSERT INTO catagoery (cname) VALUES 
('Electronics'),
('Clothing'),
('Accessories'),
('Documents'),
('Jewelry'),
('Bags'),
('Sports'),
('Books'),
('Keys'),
('Other');

-- Insert sample subcategories (assuming you have categories with IDs 1-10)
INSERT INTO souscatg (nom, id_mere) VALUES 
-- Electronics subcategories
('Mobile Phones', 1),
('Laptops', 1),
('Headphones', 1),
('Cameras', 1),

-- Clothing subcategories
('Shirts', 2),
('Pants', 2),
('Shoes', 2),
('Jackets', 2),

-- Accessories subcategories
('Watches', 3),
('Sunglasses', 3),
('Belts', 3),

-- Documents subcategories
('ID Cards', 4),
('Passports', 4),
('Licenses', 4),

-- Jewelry subcategories
('Rings', 5),
('Necklaces', 5),
('Earrings', 5);

-- Insert sample missing items
INSERT INTO fthings (discription, ville) VALUES 
('Lost iPhone 14 Pro Max, black color, cracked screen protector. Lost near the train station.', 1),
('Missing MacBook Pro 13-inch, silver color. Left in a cafe on Champs-Elysees.', 1),
('Lost AirPods Pro in white charging case. Dropped in the metro.', 1),
('Missing black leather wallet with credit cards and ID. Lost in shopping mall.', 2),
('Lost gold wedding ring with engraving "Forever". Dropped at the beach.', 5),
('Missing blue backpack with laptop inside. Left on bus line 12.', 2),
('Lost car keys with BMW keychain. Dropped in parking lot.', 3),
('Missing prescription sunglasses, Ray-Ban brand. Left at restaurant.', 4),
('Lost red scarf, wool material. Dropped while walking in park.', 1),
('Missing digital camera Canon EOS. Left at tourist attraction.', 6);
