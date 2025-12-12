-- Add leave_applications table to existing database
-- Run this script to fix 500 errors on leave management endpoints

USE gyan_school_db;

-- Create leave_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS `leave_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Reference to users table',
  `user_type` enum('student','teacher','staff') NOT NULL COMMENT 'Type of user submitting leave',
  `leave_type` enum('sick','casual','emergency','other') NOT NULL DEFAULT 'casual' COMMENT 'Type of leave being requested',
  `start_date` date NOT NULL COMMENT 'Leave start date',
  `end_date` date NOT NULL COMMENT 'Leave end date',
  `total_days` int(11) NOT NULL COMMENT 'Total number of days for leave',
  `reason` text NOT NULL COMMENT 'Reason for leave application',
  `supporting_document` varchar(255) DEFAULT NULL COMMENT 'Path to uploaded supporting document',
  `status` enum('pending','approved','declined') NOT NULL DEFAULT 'pending' COMMENT 'Leave application status',
  `reviewed_by` int(11) DEFAULT NULL COMMENT 'Admin user who reviewed the leave',
  `reviewed_at` timestamp NULL DEFAULT NULL COMMENT 'When the leave was reviewed',
  `admin_remarks` text DEFAULT NULL COMMENT 'Admin comments/remarks on the leave',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`, `user_type`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`, `end_date`),
  KEY `idx_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_leave_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Leave applications for students, teachers, and staff';

SELECT 'leave_applications table created successfully!' AS Status;
