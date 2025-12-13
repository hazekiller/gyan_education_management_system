CREATE TABLE IF NOT EXISTS `discipline_records` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `student_id` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` ENUM('behavior', 'activity', 'other') NOT NULL DEFAULT 'behavior',
  `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
  `status` ENUM('pending', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  `rating` INT(11) DEFAULT NULL COMMENT 'Rating 1-10',
  `action_taken` TEXT,
  `reported_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
