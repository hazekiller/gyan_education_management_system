-- ============================================
-- Bus Attendance Reports Table
-- ============================================
-- This table stores daily bus attendance reports
-- Created: 2025-12-04
-- ============================================

CREATE TABLE IF NOT EXISTS `bus_attendance_reports` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_date` DATE NOT NULL COMMENT 'Date of the attendance report',
  `route_id` INT(11) NOT NULL COMMENT 'Reference to transport route',
  `vehicle_id` INT(11) NOT NULL COMMENT 'Reference to transport vehicle/bus',
  `total_students` INT(11) DEFAULT 0 COMMENT 'Total students allocated to this route',
  `present_count` INT(11) DEFAULT 0 COMMENT 'Number of students present',
  `absent_count` INT(11) DEFAULT 0 COMMENT 'Number of students absent',
  `attendance_data` JSON DEFAULT NULL COMMENT 'Detailed student-wise attendance: [{student_id, status, remarks}]',
  `remarks` TEXT DEFAULT NULL COMMENT 'General remarks about the day',
  `status` ENUM('draft', 'submitted', 'verified') DEFAULT 'draft' COMMENT 'Report status workflow',
  `created_by` INT(11) NOT NULL COMMENT 'User who created the report',
  `verified_by` INT(11) DEFAULT NULL COMMENT 'User who verified the report (Principal/SuperAdmin)',
  `verified_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'When the report was verified',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_report_date` (`report_date`),
  KEY `idx_route_id` (`route_id`),
  KEY `idx_vehicle_id` (`vehicle_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_bus_attendance_route` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bus_attendance_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `transport_vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bus_attendance_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bus_attendance_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily bus attendance reports';

-- ============================================
-- Sample Data (Optional - Remove if not needed)
-- ============================================
-- Uncomment below to insert sample data for testing
/*
INSERT INTO `bus_attendance_reports` 
  (`report_date`, `route_id`, `vehicle_id`, `total_students`, `present_count`, `absent_count`, `attendance_data`, `remarks`, `status`, `created_by`) 
VALUES 
  ('2025-12-04', 1, 1, 25, 23, 2, 
   '[{"student_id": 1, "status": "present", "remarks": ""}, {"student_id": 2, "status": "absent", "remarks": "Sick leave"}]',
   'Normal day, all students accounted for', 'submitted', 1);
*/
