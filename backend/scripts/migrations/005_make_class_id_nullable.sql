-- ========================================
-- Gyan EMS v2 - Phase 3 Database Migration
-- Make class_id nullable in subject_files
-- ========================================

USE gyan_school_db;

-- Modify class_id to be nullable
ALTER TABLE subject_files MODIFY COLUMN class_id INT NULL COMMENT 'NULL means file is for subject generally (all classes)';

-- Verification query
SELECT 
  'subject_files table altered successfully' as status;
