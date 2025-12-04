-- Add employment_type to teachers table
ALTER TABLE `teachers` 
ADD COLUMN `employment_type` ENUM('full_time', 'part_time') DEFAULT 'full_time' AFTER `status`;

-- Create daily_reports table
CREATE TABLE `daily_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `content` text NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `daily_reports_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `daily_reports_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
