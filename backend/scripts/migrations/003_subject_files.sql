-- ========================================
-- Gyan EMS v2 - Phase 3 Database Migration
-- Subject Files Management System
-- ========================================

USE gyan_school_db;

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS subject_files;

-- Create subject_files table for file/folder management
CREATE TABLE subject_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT NOT NULL,
  class_id INT NOT NULL,
  section_id INT NULL COMMENT 'NULL means file is for entire class',
  
  -- File/Folder information
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL COMMENT 'Relative path from uploads directory',
  file_type VARCHAR(50) NULL COMMENT 'MIME type for files, NULL for folders',
  file_size BIGINT NULL COMMENT 'Size in bytes, NULL for folders',
  
  -- Folder hierarchy support
  parent_folder_id INT NULL COMMENT 'NULL for root level items',
  is_folder BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  uploaded_by INT NOT NULL COMMENT 'User ID of uploader',
  description TEXT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  FOREIGN KEY (parent_folder_id) REFERENCES subject_files(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_subject_files_lookup (subject_id, class_id, section_id),
  INDEX idx_parent_folder (parent_folder_id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_file_type (file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Subject files and folders for document management';

-- Insert sample data (optional - for testing)
-- Uncomment to test with sample data
/*
INSERT INTO subject_files (subject_id, class_id, section_id, file_name, file_path, file_type, file_size, parent_folder_id, is_folder, uploaded_by, description) VALUES
-- Root folder for Mathematics, Class 10
(1, 10, NULL, 'Study Materials', 'subjects/1/class_10/', NULL, NULL, NULL, TRUE, 1, 'All study materials for Mathematics'),

-- Subfolder
(1, 10, NULL, 'Chapter 1 - Sets', 'subjects/1/class_10/chapter_1/', NULL, NULL, 1, TRUE, 1, 'Chapter 1 materials'),

-- Files inside Chapter 1 folder
(1, 10, NULL, 'Sets_Notes.pdf', 'subjects/1/class_10/chapter_1/Sets_Notes.pdf', 'application/pdf', 524288, 2, FALSE, 1, 'Comprehensive notes on Sets'),
(1, 10, NULL, 'Sets_Exercises.pdf', 'subjects/1/class_10/chapter_1/Sets_Exercises.pdf', 'application/pdf', 324288, 2, FALSE, 1, 'Practice exercises');
*/

-- Verification query
SELECT 
  'subject_files table created successfully' as status,
  COUNT(*) as row_count 
FROM subject_files;

COMMIT;
