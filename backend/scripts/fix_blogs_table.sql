-- Fix blogs table to add AUTO_INCREMENT to id field
-- This script will alter the existing blogs table or create it if it doesn't exist

-- First, check if table exists and drop it if needed (optional - comment out if you want to preserve data)
-- DROP TABLE IF EXISTS blogs;

-- Create blogs table with proper AUTO_INCREMENT
CREATE TABLE IF NOT EXISTS blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author (author_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If table already exists without AUTO_INCREMENT, alter it:
-- ALTER TABLE blogs MODIFY id INT AUTO_INCREMENT;
