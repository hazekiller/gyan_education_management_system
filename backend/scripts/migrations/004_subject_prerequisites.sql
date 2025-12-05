-- ========================================
-- Gyan EMS v2 - Phase 5 Database Migration (REVISED)
-- Subject Prerequisites & Nature Configuration
-- Support for MULTIPLE prerequisite subjects
-- ========================================

USE gyan_school_db;

-- Step 1: Add prerequisite_type and subject_nature to subjects table
ALTER TABLE subjects
ADD COLUMN prerequisite_type ENUM('none', 'subject_exam') DEFAULT 'none' 
  COMMENT 'Who can read this subject: none = anyone, subject_exam = must pass prerequisite exams'
  AFTER description,

ADD COLUMN subject_nature ENUM('compulsory', 'elective') DEFAULT 'compulsory'
  COMMENT 'Subject nature: compulsory for all or elective/optional'
  AFTER prerequisite_type;

-- Step 2: Create junction table for multiple prerequisites
CREATE TABLE IF NOT EXISTS subject_prerequisites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT NOT NULL COMMENT 'The subject that has prerequisites',
  prerequisite_subject_id INT NOT NULL COMMENT 'The required prerequisite subject',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (prerequisite_subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Prevent duplicate prerequisites
  UNIQUE KEY unique_prerequisite (subject_id, prerequisite_subject_id),
  
  -- Prevent self-reference
  CHECK (subject_id != prerequisite_subject_id),
  
  -- Indexes for performance
  INDEX idx_subject (subject_id),
  INDEX idx_prerequisite (prerequisite_subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Many-to-many relationship for subject prerequisites';

-- Step 3: Add indexes to subjects table
ALTER TABLE subjects
ADD INDEX idx_prerequisite_type (prerequisite_type);

-- Sample data examples (commented out - for testing)
/*
-- Example 1: Advanced Physics requires Physics I AND Mathematics
INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id) VALUES
(11, 2),  -- Advanced Physics requires Science
(11, 1);  -- Advanced Physics requires Mathematics

-- Example 2: Set subjects as elective
UPDATE subjects SET subject_nature = 'elective' WHERE id IN (7, 8, 9);

-- Example 3: Set prerequisite type
UPDATE subjects SET prerequisite_type = 'subject_exam' WHERE id = 11;
*/

-- Verification query
SELECT 
  'Database updated successfully' as status,
  (SELECT COUNT(*) FROM subjects) as total_subjects,
  (SELECT COUNT(*) FROM subjects WHERE prerequisite_type = 'subject_exam') as subjects_with_prerequisites,
  (SELECT COUNT(*) FROM subjects WHERE subject_nature = 'elective') as elective_subjects,
  (SELECT COUNT(*) FROM subject_prerequisites) as total_prerequisite_relationships;

COMMIT;
