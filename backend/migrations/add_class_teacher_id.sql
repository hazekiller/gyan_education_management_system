-- Migration to add class_teacher_id column to classes table
-- This fixes the error: Unknown column 'class_teacher_id' in 'field list'

-- Add class_teacher_id column if it doesn't exist
ALTER TABLE `classes`
ADD COLUMN IF NOT EXISTS `class_teacher_id` INT(11) DEFAULT NULL AFTER `academic_year`,
ADD CONSTRAINT `fk_classes_teacher` 
  FOREIGN KEY (`class_teacher_id`) 
  REFERENCES `teachers` (`id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Note: The column should be added between academic_year and room_number
-- to match the schema in gyan_school_db.sql
