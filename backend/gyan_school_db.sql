-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 05, 2025 at 06:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gyan_school_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admissions`
--

CREATE TABLE `admissions` (
  `id` int(11) NOT NULL,
  `application_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `class_applied_for` int(11) NOT NULL,
  `previous_school` varchar(255) DEFAULT NULL,
  `parent_name` varchar(255) NOT NULL,
  `parent_phone` varchar(20) NOT NULL,
  `parent_email` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `status` enum('pending','approved','rejected','admitted') DEFAULT 'pending',
  `application_date` date DEFAULT curdate(),
  `admission_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admissions`
--

INSERT INTO `admissions` (`id`, `application_number`, `first_name`, `middle_name`, `last_name`, `date_of_birth`, `gender`, `class_applied_for`, `previous_school`, `parent_name`, `parent_phone`, `parent_email`, `address`, `city`, `state`, `pincode`, `status`, `application_date`, `admission_date`, `remarks`, `processed_by`, `created_at`, `updated_at`) VALUES
(1, 'APP-2025-210906', 'Ram', '', 'Baskota', '2008-07-06', 'male', 10, 'mt eversrt ss', 'shyam baskota', '9814945424', 'sunabbaskota@gmail.com', 'Ratopul', 'Kathmandu', 'Bagmati Province', '44600', 'approved', '2025-11-30', NULL, '', 1, '2025-11-30 08:10:10', '2025-11-30 08:21:41');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `target_audience` enum('all','students','teachers','staff','parents','specific_class') DEFAULT 'all',
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `published_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `priority`, `target_audience`, `class_id`, `section_id`, `expires_at`, `is_active`, `created_by`, `published_at`, `updated_at`) VALUES
(1, 'School Reopening After Festivals', 'Dear, Students the school will resume the regular class from Tuesday, just after Chhath', 'urgent', 'students', NULL, NULL, '2025-10-30 00:00:00', 1, 1, '2025-10-24 00:00:00', '2025-10-24 08:14:19'),
(2, 'Starting of Class 10 Coaching Class ', 'Dear all class 10 students this is to announce that your coaching class is doing to start from the Nextweek so be prepared..\n', 'urgent', 'students', NULL, NULL, '2025-12-06 00:00:00', 1, 1, '2025-11-27 18:15:00', '2025-11-29 08:03:56'),
(3, 'Exam incoming', 'Exam is coming be preparedd', 'medium', 'students', NULL, NULL, NULL, 1, 1, '2025-11-28 18:15:00', '2025-11-29 17:28:31'),
(4, 'urdfhdshjh', 'kjdfhkjdshjfhkjdshkj', 'urgent', 'students', NULL, NULL, NULL, 1, 1, '2025-11-28 18:15:00', '2025-11-29 17:40:47'),
(5, 'dfdgtfhgytr6e54w3q23467khyugjcfhdxgtszer', 'rrteyr6i7oliu;okjbhn 465786ui7o8 n6 4 ab35nsui76il.oikujhgtn aw3ww', 'urgent', 'all', NULL, NULL, NULL, 1, 1, '2025-11-28 18:15:00', '2025-11-29 17:57:49');

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `due_date` date NOT NULL,
  `total_marks` int(11) DEFAULT 100,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `title`, `description`, `class_id`, `section_id`, `subject_id`, `created_by`, `due_date`, `total_marks`, `attachments`, `status`, `created_at`, `updated_at`) VALUES
(2, 'homework', ';lkjhgfdsdfrgthyjumnbvfcrgthyjukil,mnbvfdsderty7u8iop;', 8, 12, 10, 2, '2025-12-01', 20, '[\"uploads/assignments/attachments-Company_Registration_in_Nepal___Online_Registration_Process-1764425212906-556308591.pdf\"]', 'active', '2025-11-29 14:06:52', '2025-11-29 14:06:52'),
(3, 'Mathematics chapter-8 Exercise 8.2 all', 'read carefully and submit', 13, 7, 1, 2, '2025-12-07', 20, '[\"uploads/assignments/attachments-usa_sales_tax_by_state-1764737819226-248653681.pdf\"]', 'active', '2025-12-03 04:56:59', '2025-12-03 04:56:59'),
(4, 'Mathematics chapter-8 Exercise 8.2 all', 'read carefully and submit', 13, 8, 1, 2, '2025-12-07', 20, '[\"uploads/assignments/attachments-usa_sales_tax_by_state-1764737819226-248653681.pdf\"]', 'active', '2025-12-03 04:56:59', '2025-12-03 04:56:59');

-- --------------------------------------------------------

--
-- Table structure for table `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_text` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `status` enum('submitted','late','graded','returned') DEFAULT 'submitted',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `graded_at` timestamp NULL DEFAULT NULL,
  `graded_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignment_submissions`
--

INSERT INTO `assignment_submissions` (`id`, `assignment_id`, `student_id`, `submission_text`, `attachments`, `marks_obtained`, `feedback`, `status`, `submitted_at`, `graded_at`, `graded_by`) VALUES
(1, 2, 2, 'answer', '[\"uploads/assignments/attachments-Company_Registration_in_Nepal___Online_Registration_Process-1764431712987-431835038.pdf\"]', 15.00, 'good', 'graded', '2025-11-29 15:55:13', '2025-11-29 15:55:48', 6);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late','half_day','excused') NOT NULL,
  `remarks` text DEFAULT NULL,
  `marked_by` int(11) DEFAULT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_submitted` tinyint(1) DEFAULT 0,
  `submitted_at` datetime DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subject_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `class_id`, `section_id`, `date`, `status`, `remarks`, `marked_by`, `marked_at`, `is_submitted`, `submitted_at`, `submitted_by`, `updated_at`, `subject_id`) VALUES
(6, 3, 13, 8, '2025-11-24', 'present', NULL, 1, '2025-11-24 07:51:27', 0, NULL, NULL, '2025-11-24 08:00:02', NULL),
(7, 2, 13, 7, '2025-11-24', 'absent', NULL, 1, '2025-11-24 11:52:00', 1, '2025-11-24 17:37:00', 1, '2025-11-24 11:52:00', NULL),
(8, 2, 13, 7, '2025-11-26', 'present', NULL, 6, '2025-11-26 13:20:06', 1, '2025-11-26 19:05:06', 6, '2025-11-26 13:20:06', NULL),
(9, 5, 8, 12, '2025-11-29', 'present', NULL, 1, '2025-11-29 10:33:40', 1, '2025-11-29 16:18:40', 1, '2025-11-29 10:33:40', NULL),
(10, 2, 13, 7, '2025-11-29', 'present', NULL, 6, '2025-11-29 13:17:17', 1, '2025-11-29 19:02:17', 6, '2025-11-29 13:17:17', NULL),
(11, 1, 14, 10, '2025-11-29', 'present', NULL, 1, '2025-11-29 13:26:40', 1, '2025-11-29 19:11:40', 1, '2025-11-29 13:26:40', NULL),
(12, 3, 13, 8, '2025-11-29', 'present', NULL, 1, '2025-11-29 13:26:53', 1, '2025-11-29 19:11:53', 1, '2025-11-29 13:26:53', NULL),
(13, 3, 8, 12, '2025-11-30', 'present', NULL, 1, '2025-11-30 07:01:52', 1, '2025-11-30 12:46:52', 1, '2025-11-30 07:01:52', NULL),
(14, 5, 8, 12, '2025-11-30', 'present', NULL, 1, '2025-11-30 07:01:52', 1, '2025-11-30 12:46:52', 1, '2025-11-30 07:01:52', NULL),
(16, 2, 13, 7, '2025-11-30', 'present', NULL, 1, '2025-11-30 07:02:02', 1, '2025-11-30 12:47:02', 1, '2025-11-30 07:02:02', NULL),
(17, 1, 14, 10, '2025-11-30', 'present', NULL, 1, '2025-11-30 07:02:16', 1, '2025-11-30 12:47:16', 1, '2025-11-30 07:02:16', NULL),
(18, 14, 4, 14, '2025-11-30', 'present', NULL, 1, '2025-11-30 07:23:10', 1, '2025-11-30 13:08:10', 1, '2025-11-30 07:23:10', NULL),
(19, 6, 1, 15, '2025-11-30', 'present', NULL, 1, '2025-11-30 07:48:18', 1, '2025-11-30 13:33:18', 1, '2025-11-30 07:48:18', NULL),
(20, 8, 2, 17, '2025-11-30', 'present', NULL, 1, '2025-11-30 07:54:18', 1, '2025-11-30 13:39:19', 1, '2025-11-30 07:54:19', NULL),
(21, 1, 14, 10, '2025-12-04', 'excused', NULL, 6, '2025-12-04 07:26:08', 1, '2025-12-04 13:11:08', 6, '2025-12-04 07:26:08', 1);

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `status` enum('published','draft') DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `title`, `content`, `author_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'test blog', 'test', 1, 'published', '2025-12-04 12:32:16', '2025-12-04 12:32:16');

-- --------------------------------------------------------

--
-- Table structure for table `bus_attendance_reports`
--

CREATE TABLE `bus_attendance_reports` (
  `id` int(11) NOT NULL,
  `report_date` date NOT NULL COMMENT 'Date of the attendance report',
  `route_id` int(11) NOT NULL COMMENT 'Reference to transport route',
  `vehicle_id` int(11) NOT NULL COMMENT 'Reference to transport vehicle/bus',
  `total_students` int(11) DEFAULT 0 COMMENT 'Total students allocated to this route',
  `present_count` int(11) DEFAULT 0 COMMENT 'Number of students present',
  `absent_count` int(11) DEFAULT 0 COMMENT 'Number of students absent',
  `attendance_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Detailed student-wise attendance: [{student_id, status, remarks}]' CHECK (json_valid(`attendance_data`)),
  `remarks` text DEFAULT NULL COMMENT 'General remarks about the day',
  `status` enum('draft','submitted','verified') DEFAULT 'draft' COMMENT 'Report status workflow',
  `created_by` int(11) NOT NULL COMMENT 'User who created the report',
  `verified_by` int(11) DEFAULT NULL COMMENT 'User who verified the report (Principal/SuperAdmin)',
  `verified_at` timestamp NULL DEFAULT NULL COMMENT 'When the report was verified',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Daily bus attendance reports';

--
-- Dumping data for table `bus_attendance_reports`
--

INSERT INTO `bus_attendance_reports` (`id`, `report_date`, `route_id`, `vehicle_id`, `total_students`, `present_count`, `absent_count`, `attendance_data`, `remarks`, `status`, `created_by`, `verified_by`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, '2025-12-04', 2, 2, 3, 2, 1, '[{\"student_id\":6,\"student_name\":\"Aashish Yadav\",\"status\":\"present\",\"remarks\":\"\"},{\"student_id\":10,\"student_name\":\"Manish Gurung\",\"status\":\"absent\",\"remarks\":\"sick\"},{\"student_id\":7,\"student_name\":\"Nisha KC\",\"status\":\"present\",\"remarks\":\"\"}]', '', 'verified', 1, 1, '2025-12-04 12:27:51', '2025-12-04 12:27:27', '2025-12-04 12:27:51');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade_level` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `class_teacher_id` int(11) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `capacity` int(11) DEFAULT 40,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `grade_level`, `description`, `academic_year`, `class_teacher_id`, `room_number`, `capacity`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Class 1', 1, 'First grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(2, 'Class 2', 2, 'Second grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(3, 'Class 3', 3, 'Third grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(4, 'Class 4', 4, 'Fourth grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(5, 'Class 5', 5, 'Fifth grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(6, 'Class 6', 6, 'Sixth grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(7, 'Class 7', 7, 'Seventh grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(8, 'Class 8', 8, 'Eighth grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(9, 'Class 9', 9, 'Ninth grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(10, 'Class 10', 10, 'Tenth grade', '2024-2025', NULL, NULL, 40, 'active', 1, '2025-10-22 11:07:23', '2025-11-23 14:13:53'),
(12, 'Annapurna', 12, 'sdfkdkjsfjdshbjfbdsjb kjsdh jkejfhjsdjewuh hjdsh yuefgdshbg', '2026', 2, 'Room 420', 32, 'active', 1, '2025-11-23 09:09:33', '2025-11-23 09:29:48'),
(13, 'Test Class', 11, 'dkjhfjsdhjfhjdshjeruyyuerhjdfb ewuyh sjdhus', '2025-2026', 2, 'Room 320', 20, 'active', 1, '2025-11-23 14:08:05', '2025-11-23 14:08:05'),
(14, 'Class 13', 12, 'sadfgaerwrwthrndgfcxzv wegfd rewerfsdvcx', '2025-2026`', NULL, 'Room 520', 50, 'active', 1, '2025-11-24 11:57:48', '2025-11-24 11:57:48');

-- --------------------------------------------------------

--
-- Table structure for table `class_subjects`
--

CREATE TABLE `class_subjects` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `weekly_hours` int(11) DEFAULT NULL COMMENT 'Number of hours per week',
  `credit_hours` decimal(3,1) DEFAULT NULL COMMENT 'Credit hours for the subject',
  `is_mandatory` tinyint(1) DEFAULT 1 COMMENT 'Is this subject mandatory?',
  `passing_marks_percentage` decimal(5,2) DEFAULT 40.00 COMMENT 'Minimum percentage to pass',
  `max_marks` int(11) DEFAULT 100 COMMENT 'Maximum marks for this subject',
  `theory_marks` int(11) DEFAULT NULL COMMENT 'Theory portion marks',
  `practical_marks` int(11) DEFAULT NULL COMMENT 'Practical portion marks',
  `display_order` int(11) DEFAULT 0 COMMENT 'Order to display subjects',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `class_subjects`
--

INSERT INTO `class_subjects` (`id`, `class_id`, `subject_id`, `teacher_id`, `academic_year`, `is_active`, `weekly_hours`, `credit_hours`, `is_mandatory`, `passing_marks_percentage`, `max_marks`, `theory_marks`, `practical_marks`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 14, 8, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(2, 14, 6, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(3, 14, 3, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(4, 14, 1, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(5, 14, 7, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(6, 14, 4, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(7, 14, 2, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(8, 14, 9, NULL, '2025-2026`', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-25 12:28:59', '2025-11-25 12:28:59'),
(9, 8, 8, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(10, 8, 6, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(11, 8, 3, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(12, 8, 9, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(13, 8, 1, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(14, 8, 10, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(15, 8, 4, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(16, 8, 2, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(17, 8, 7, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 10:31:24', '2025-11-29 10:31:24'),
(18, 4, 8, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(19, 4, 6, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(20, 4, 3, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(21, 4, 9, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(22, 4, 1, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(23, 4, 4, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(24, 4, 10, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(25, 4, 7, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(26, 4, 2, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:49:38', '2025-11-29 12:49:38'),
(27, 1, 8, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:52:35', '2025-11-29 12:52:35'),
(28, 1, 3, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:52:35', '2025-11-29 12:52:35'),
(29, 1, 1, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:52:35', '2025-11-29 12:52:35'),
(30, 1, 9, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:52:35', '2025-11-29 12:52:35'),
(31, 1, 6, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 12:52:35', '2025-11-29 12:52:35'),
(32, 13, 8, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:42', '2025-11-29 16:25:42'),
(33, 13, 6, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:42', '2025-11-29 16:25:42'),
(34, 13, 3, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:42', '2025-11-29 16:25:42'),
(35, 13, 1, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:43', '2025-11-29 16:25:43'),
(36, 13, 4, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:43', '2025-11-29 16:25:43'),
(37, 13, 2, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:43', '2025-11-29 16:25:43'),
(38, 13, 7, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:43', '2025-11-29 16:25:43'),
(39, 13, 10, NULL, '2025-2026', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-11-29 16:25:43', '2025-11-29 16:25:43'),
(40, 7, 6, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28'),
(41, 7, 1, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28'),
(42, 7, 3, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28'),
(43, 7, 5, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28'),
(44, 7, 7, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28'),
(45, 7, 4, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28'),
(46, 7, 2, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28'),
(47, 7, 8, NULL, '2024-2025', 1, NULL, NULL, 1, 40.00, 100, NULL, NULL, 0, '2025-12-03 03:55:28', '2025-12-03 03:55:28');

-- --------------------------------------------------------

--
-- Table structure for table `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `content` text NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_type` enum('academic','sports','cultural','meeting','holiday','exam','parent_teacher','other') NOT NULL,
  `event_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `target_audience` enum('all','students','teachers','staff','parents','specific_class') DEFAULT 'all',
  `is_holiday` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `event_type`, `event_date`, `start_time`, `end_time`, `location`, `target_audience`, `is_holiday`, `created_by`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'Annual Sports Day', 'SPOOORRRRRRRTTTTTTSSSSSSS DDDDDDDDAAAAAAAYYYYYY !!!!!!!!!!!!!', 'sports', '2025-11-29', '10:00:00', '17:00:00', 'school mall', 'all', 1, 1, 1, '2025-11-29 12:56:26', '2025-11-29 13:02:55'),
(4, 'Exam Update', 'Your Exam is somming soon so be prepeared', 'exam', '2025-12-09', '11:00:00', '14:00:00', 'Own School', 'students', 0, 1, 1, '2025-11-29 17:25:15', '2025-11-29 17:25:15'),
(5, 'lkjhgf', 'ghv vgfvhg fg fyjf y v gh hg fgh fbtyftyfytfyhgfghj tyu hghghjgv hyuvhvkck', 'cultural', '2025-12-02', '10:10:00', '18:25:00', 'school mall', 'all', 0, 1, 1, '2025-11-29 17:37:06', '2025-11-29 17:37:06'),
(6, 'jdfhjbdsjgfdsjbgj', 'jhdfjjsdbfjbdsb', 'sports', '2025-11-30', '10:00:00', '14:00:00', 'School', 'students', 0, 1, 1, '2025-11-29 17:44:32', '2025-11-29 17:44:32'),
(7, 'dahsdjhaj', 'hjgfgwhjgfhwgh', 'sports', '2025-12-02', '10:00:00', '14:00:00', 'uk', 'students', 0, 1, 1, '2025-11-29 17:48:39', '2025-11-29 17:48:39'),
(8, 'oi0t67e5awszdfxcvgihojighcfvhjb', ' klkugv bnhoyutfguiu;ohygfvjghiyobgcgh', 'cultural', '2025-12-05', '10:00:00', '14:00:00', 'school mall', 'all', 0, 1, 1, '2025-11-29 17:59:01', '2025-11-29 17:59:01');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `exam_type` enum('term','midterm','final','unit_test','monthly','quarterly','annual') NOT NULL,
  `class_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_marks` int(11) NOT NULL,
  `passing_marks` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `name`, `exam_type`, `class_id`, `academic_year`, `start_date`, `end_date`, `total_marks`, `passing_marks`, `description`, `created_by`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Science', 'term', 1, '2025-2026', '2025-10-23', '2025-10-23', 100, 50, 'read carefully with reference to syllabus', 1, 1, '2025-10-22 18:43:11', '2025-10-22 18:43:11'),
(2, 'Science', 'term', 1, '2024-2025', '2025-10-23', '2025-10-23', 100, 50, 'read well', 1, 1, '2025-10-22 18:44:33', '2025-10-22 18:44:33'),
(3, 'Test EXAM', 'midterm', 13, '2024-2025', '2025-11-30', '2025-12-06', 50, 20, 'lkjhgfdsftryuiytrdsftiuojgyucfbgvhnjbhv vbhygtfdrxfcghyjugtgf', NULL, 1, '2025-11-29 16:02:20', '2025-11-29 16:27:37'),
(4, 'Mid Term Exam', 'term', 7, '2025-2026', '2025-12-07', '2025-12-13', 80, 30, '', NULL, 1, '2025-12-03 03:54:53', '2025-12-03 03:54:53');

-- --------------------------------------------------------

--
-- Table structure for table `exam_results`
--

CREATE TABLE `exam_results` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) NOT NULL,
  `max_marks` int(11) NOT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `entered_by` int(11) DEFAULT NULL,
  `entered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_results`
--

INSERT INTO `exam_results` (`id`, `exam_id`, `student_id`, `subject_id`, `marks_obtained`, `max_marks`, `grade`, `remarks`, `entered_by`, `entered_at`, `updated_at`) VALUES
(1, 3, 2, 10, 40.00, 50, 'A', 'good', 6, '2025-11-29 16:37:44', '2025-11-29 16:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `exam_schedule`
--

CREATE TABLE `exam_schedule` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `max_marks` int(11) NOT NULL,
  `passing_marks` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_schedule`
--

INSERT INTO `exam_schedule` (`id`, `exam_id`, `subject_id`, `exam_date`, `start_time`, `end_time`, `room_number`, `max_marks`, `passing_marks`, `created_at`) VALUES
(1, 3, 10, '2025-11-29', '11:00:00', '14:00:00', 'Room 520', 50, 20, '2025-11-29 16:26:44');

-- --------------------------------------------------------

--
-- Table structure for table `fee_heads`
--

CREATE TABLE `fee_heads` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fee_heads`
--

INSERT INTO `fee_heads` (`id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Tuition Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(2, 'Admission Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(3, 'Exam Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(4, 'Library Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(5, 'Transport Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(6, 'Sports Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(7, 'Laboratory Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(8, 'Development Fee', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47'),
(9, 'Other', NULL, 1, '2025-11-27 18:20:47', '2025-11-27 18:20:47');

-- --------------------------------------------------------

--
-- Table structure for table `fee_payments`
--

CREATE TABLE `fee_payments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `fee_structure_id` int(11) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('cash','card','cheque','online','bank_transfer') NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `receipt_number` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `collected_by` int(11) DEFAULT NULL,
  `status` enum('completed','pending','failed','refunded') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fee_payments`
--

INSERT INTO `fee_payments` (`id`, `student_id`, `fee_structure_id`, `amount_paid`, `payment_date`, `payment_method`, `transaction_id`, `receipt_number`, `remarks`, `collected_by`, `status`, `created_at`) VALUES
(1, 2, 1, 2500.00, '2025-11-27', 'cash', NULL, NULL, 'Counter collection', 1, 'completed', '2025-11-27 18:30:07'),
(2, 4, 2, 20000.00, '2025-11-29', 'cash', NULL, NULL, 'Counter collection', 1, 'completed', '2025-11-29 08:06:21'),
(3, 3, 1, 2500.00, '2025-11-29', 'cash', NULL, NULL, 'Counter collection', 1, 'completed', '2025-11-29 11:49:07');

-- --------------------------------------------------------

--
-- Table structure for table `fee_structure`
--

CREATE TABLE `fee_structure` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `fee_head_id` int(11) DEFAULT NULL,
  `fee_type` enum('tuition','admission','exam','library','transport','sports','laboratory','development','other') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `period_type` enum('monthly','yearly','one_time','term') DEFAULT 'monthly',
  `period_value` int(11) DEFAULT 1,
  `due_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fee_structure`
--

INSERT INTO `fee_structure` (`id`, `class_id`, `fee_head_id`, `fee_type`, `amount`, `academic_year`, `period_type`, `period_value`, `due_date`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 13, 1, 'tuition', 2500.00, '2024-2025', 'monthly', 1, '2025-11-27', '', 1, '2025-11-27 18:29:40', '2025-11-27 18:29:40'),
(2, 10, 2, 'tuition', 20000.00, '2024-2025', 'monthly', 1, '2025-12-02', '', 1, '2025-11-29 08:06:04', '2025-11-29 08:06:04');

-- --------------------------------------------------------

--
-- Table structure for table `hostel_allocations`
--

CREATE TABLE `hostel_allocations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `allocation_date` date DEFAULT curdate(),
  `status` enum('active','vacated') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hostel_allocations`
--

INSERT INTO `hostel_allocations` (`id`, `student_id`, `room_id`, `allocation_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2025-11-28', 'active', '2025-11-28 06:22:36', '2025-11-28 06:22:36'),
(2, 5, 1, '2025-11-29', 'vacated', '2025-11-29 10:59:48', '2025-11-29 10:59:57'),
(3, 5, 2, '2025-11-29', 'active', '2025-11-29 11:00:40', '2025-11-29 11:00:40');

-- --------------------------------------------------------

--
-- Table structure for table `hostel_rooms`
--

CREATE TABLE `hostel_rooms` (
  `id` int(11) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `building_name` varchar(100) DEFAULT 'Main Hostel',
  `type` enum('male','female') NOT NULL,
  `capacity` int(11) DEFAULT 4,
  `current_occupancy` int(11) DEFAULT 0,
  `status` enum('active','maintenance') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hostel_rooms`
--

INSERT INTO `hostel_rooms` (`id`, `room_number`, `building_name`, `type`, `capacity`, `current_occupancy`, `status`, `created_at`, `updated_at`) VALUES
(1, '501', 'Main Hostel', 'male', 5, 1, 'active', '2025-11-28 06:22:03', '2025-11-29 10:59:57'),
(2, '901', 'Girls Dorm', 'female', 5, 1, 'active', '2025-11-28 06:22:25', '2025-11-29 11:00:40');

-- --------------------------------------------------------

--
-- Table structure for table `library_books`
--

CREATE TABLE `library_books` (
  `id` int(11) NOT NULL,
  `book_title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(50) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `publication_year` int(11) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `total_copies` int(11) DEFAULT 1,
  `available_copies` int(11) DEFAULT 1,
  `rack_number` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `library_books`
--

INSERT INTO `library_books` (`id`, `book_title`, `author`, `isbn`, `publisher`, `publication_year`, `category`, `total_copies`, `available_copies`, `rack_number`, `description`, `added_at`) VALUES
(1, 'Quantum Physics', 'Prakash Dai', '', NULL, NULL, 'Physics', 45, 45, '12', '', '2025-11-27 18:45:29'),
(3, 'random', 'sunahghgv', NULL, NULL, NULL, ',mbv mn', 1, 1, '54', '', '2025-11-29 18:52:40'),
(7, 'Test book', 'Sunab', '1011N', NULL, NULL, 'Test', 200, 200, '500', '', '2025-11-30 06:43:13');

-- --------------------------------------------------------

--
-- Table structure for table `library_transactions`
--

CREATE TABLE `library_transactions` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('student','teacher','staff') NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('issued','returned','overdue','lost') DEFAULT 'issued',
  `remarks` text DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `library_transactions`
--

INSERT INTO `library_transactions` (`id`, `book_id`, `user_id`, `user_type`, `issue_date`, `due_date`, `return_date`, `fine_amount`, `status`, `remarks`, `issued_by`) VALUES
(2, 1, 8, 'student', '2025-11-27', '2025-12-11', '2025-11-27', 0.00, 'returned', NULL, 1),
(3, 1, 8, 'student', '2025-11-28', '2025-12-12', '2025-11-28', 0.00, 'returned', NULL, 1),
(4, 3, 11, 'student', '2025-11-30', '2025-12-13', '2025-11-30', 0.00, 'returned', NULL, 1),
(5, 7, 4, 'student', '2025-11-30', '2025-12-14', '2025-11-30', 0.00, 'returned', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 'hu', 1, '2025-10-24 08:48:19', '2025-10-24 08:51:29'),
(3, 4, 4, 'hello bro how are u', 1, '2025-10-24 08:51:17', '2025-10-24 08:51:17'),
(4, 1, 4, 'hi', 1, '2025-10-24 08:51:58', '2025-10-24 09:18:49'),
(5, 1, 4, 'k chha bhai', 1, '2025-10-24 09:17:47', '2025-10-24 09:18:49'),
(6, 1, 4, 'call me', 1, '2025-10-24 09:17:50', '2025-10-24 09:18:49'),
(7, 4, 4, 'ok sir on whatsapp or on school app?', 1, '2025-10-24 09:18:47', '2025-10-24 09:18:47'),
(8, 1, 8, 'hello', 1, '2025-11-29 19:05:21', '2025-11-29 19:05:32'),
(9, 8, 1, 'yes', 1, '2025-11-29 19:05:38', '2025-11-29 19:05:38'),
(10, 1, 8, 'Hello', 1, '2025-11-30 10:14:50', '2025-11-30 10:14:54');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error','announcement') DEFAULT 'info',
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `read_at`, `created_at`) VALUES
(65, 8, 'New Assignment: Mathematics chapter-8 Exercise 8.2 all', 'A new assignment \"Mathematics chapter-8 Exercise 8.2 all\" is due on 12/7/2025.', 'info', '/assignments/3', 1, '2025-12-03 13:50:18', '2025-12-03 04:56:59');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL,
  `employee_type` enum('teacher','staff') NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` varchar(20) NOT NULL,
  `year` int(11) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT 0.00,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` enum('cash','cheque','bank_transfer') NOT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `processed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `employee_type`, `employee_id`, `month`, `year`, `basic_salary`, `allowances`, `deductions`, `net_salary`, `payment_date`, `payment_method`, `remarks`, `status`, `processed_by`, `created_at`, `updated_at`) VALUES
(1, 'teacher', 2, 'November', 2025, 20000.00, 500.00, 0.00, 20500.00, '2025-11-29', 'cash', 'kjhgfdswertyuilop', 'paid', 1, '2025-11-29 10:17:42', '2025-11-29 10:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `class_id` int(11) NOT NULL,
  `class_teacher_id` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT 40,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `name`, `class_id`, `class_teacher_id`, `capacity`, `is_active`, `created_at`, `updated_at`) VALUES
(7, 'A', 13, 2, 20, 1, '2025-11-23 14:08:05', '2025-11-24 07:42:15'),
(8, 'B', 13, 1, 20, 1, '2025-11-23 14:08:05', '2025-11-24 07:43:22'),
(9, 'A', 14, NULL, 50, 1, '2025-11-24 11:57:48', '2025-11-24 11:57:48'),
(10, 'B', 14, NULL, 50, 1, '2025-11-24 11:57:48', '2025-12-04 07:13:36'),
(11, 'C', 14, NULL, 50, 1, '2025-11-24 11:57:48', '2025-11-24 11:57:48'),
(12, 'A', 8, 2, 25, 1, '2025-11-29 10:32:13', '2025-11-29 10:32:25'),
(13, 'A', 4, NULL, 40, 1, '2025-11-29 12:49:16', '2025-11-29 12:49:16'),
(14, 'B', 4, NULL, 40, 1, '2025-11-29 12:49:20', '2025-11-29 12:49:20'),
(15, 'A', 1, NULL, 30, 1, '2025-11-29 12:52:45', '2025-12-02 14:05:21'),
(16, 'B', 1, NULL, 40, 1, '2025-11-29 12:52:50', '2025-11-29 12:52:50'),
(17, 'A', 2, NULL, 40, 1, '2025-11-30 07:53:12', '2025-11-30 07:53:12'),
(18, 'B', 2, NULL, 40, 1, '2025-11-30 07:53:18', '2025-11-30 07:53:18');

-- --------------------------------------------------------

--
-- Table structure for table `section_subject_teachers`
--

CREATE TABLE `section_subject_teachers` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Manages subject teachers assigned to specific sections';

--
-- Dumping data for table `section_subject_teachers`
--

INSERT INTO `section_subject_teachers` (`id`, `section_id`, `teacher_id`, `subject_id`, `academic_year`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 8, 2, 1, '2025-2026', 1, '2025-11-24 07:43:29', '2025-11-24 07:43:29'),
(3, 11, 2, 8, '2025-2026`', 1, '2025-11-25 11:58:05', '2025-11-25 11:58:05'),
(4, 13, 13, 8, '2024-2025', 1, '2025-11-29 12:49:53', '2025-11-29 12:49:53'),
(5, 16, 15, 3, '2024-2025', 1, '2025-11-29 12:53:04', '2025-11-29 12:53:04'),
(6, 7, 2, 1, '2025-2026', 1, '2025-12-03 04:53:13', '2025-12-03 04:53:13'),
(7, 10, 2, 1, '2025-2026`', 1, '2025-12-04 07:13:48', '2025-12-04 07:13:48');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `employee_id` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `joining_date` date NOT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive','resigned','retired') DEFAULT 'active',
  `profile_photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `admission_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `parent_phone` varchar(20) NOT NULL,
  `parent_email` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `guardian_name` varchar(255) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `roll_number` varchar(20) DEFAULT NULL,
  `admission_date` date NOT NULL,
  `status` enum('active','inactive','graduated','transferred','dropped') DEFAULT 'active',
  `profile_photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `admission_number`, `first_name`, `middle_name`, `last_name`, `email`, `date_of_birth`, `gender`, `blood_group`, `address`, `city`, `state`, `pincode`, `phone`, `parent_phone`, `parent_email`, `father_name`, `mother_name`, `guardian_name`, `class_id`, `section_id`, `roll_number`, `admission_date`, `status`, `profile_photo`, `created_at`, `updated_at`) VALUES
(1, 4, 'Gyan-01', 'Prakash', '', 'Timilsina', 'prakashtimilsina76@gmail.com', '1993-08-22', 'male', 'B+', 'Schoolchaun', 'Jhapa', 'Koshi', '44600', '9813453997', '9813453997', 'bhuwanshrestha475@gmail.com', 'Tara Nath Timilsina', 'Nara Maya Adhikari(Timilsina)', NULL, 14, 10, '1', '2025-10-21', 'active', NULL, '2025-10-22 18:32:46', '2025-11-24 11:59:14'),
(2, 8, 'STU001', 'Sunab', NULL, 'Baskota', 'sunabbaskota15@gmail.com', '2001-09-15', 'male', 'O+', 'Gauradaha-05, Schoolchaun', 'Gauradaha', 'Koshi Province', '57200', '9814945424', '9842763697', 'sitabaskota196@gmail.com', 'Ganesh Prasad Baskota', 'Indra Maya Baskota', NULL, 13, 7, '1', '2025-11-23', 'active', 'uploads/profiles/profile_photo-Quantum_Tech-1763911226488-10710789.png', '2025-11-23 15:20:26', '2025-11-23 15:20:26'),
(3, 9, 'STU002', 'Test ', NULL, 'Student', 'test1@gmail.com', '2012-12-11', 'male', 'A+', '625', 'Kathmandu', 'Bagmati Province', '44600', '1234567890', '9874563210', 'admin@gmail.com', 'Test Test', 'Test Test', NULL, 8, 12, '1', '2025-11-23', 'active', NULL, '2025-11-24 07:51:02', '2025-11-29 14:07:54'),
(4, 10, 'STU0010', 'Ram', 'Lal', 'Shrestha', 'ram@gyanstu.edu', '2011-11-11', 'male', 'AB+', '625', 'Kathmandu', 'Bagmati', '44600', '7894562230', '0000000000', 'test@gmail.com', 'Test Test', 'Test Test', NULL, 10, NULL, '11', '2025-11-29', 'active', 'uploads/profiles/profile_photo-Quantum_Tech-1764403260967-497247316.png', '2025-11-29 08:01:01', '2025-11-29 08:01:01'),
(5, 11, 'STU0011', 'Prasunna', NULL, 'Khanal', 'prasunakhanal@gyanedu.edu', '2009-02-20', 'female', NULL, 'Gauradaha-05, Schoolchaun', 'guaradaha', 'Koshi Province', '57200', '1122334455', '9988776655', 'parent@gmail.com', 'Test Test', 'Test Test', NULL, 8, 12, '13', '2025-11-27', 'active', 'uploads/profiles/profile_photo-Screenshot_2025-09-16_01_32_22-1764403887480-869630252.png', '2025-11-29 08:11:27', '2025-11-29 11:00:25'),
(6, NULL, 'ADM003', 'Aashish', 'Prasad', 'Yadav', 'ashishyadav@gyanstu.edu', '2009-11-09', 'male', 'O+', 'Janakpur-4', 'Janakpur', 'Madhesh', '45600', '9800000003', '9810000003', 'parent3@example.com', 'Ram Yadav', 'Gita Yadav', 'Brother Suresh', 1, 15, '3', '2020-04-10', 'active', 'aashish.jpg', '2025-11-29 11:37:17', '2025-11-30 07:47:22'),
(7, NULL, 'ADM004', 'Nisha', '', 'KC', 'nisha@example.com', '2010-06-18', 'female', 'AB+', 'Pokhara-8', 'Pokhara', 'Gandaki', '33700', '9800000004', '9810000004', 'parent4@example.com', 'Narayan KC', 'Lila KC', 'Uncle Chandra', 1, NULL, '4', '2020-04-11', 'active', 'nisha.jpg', '2025-11-29 11:37:17', '2025-11-29 11:37:17'),
(8, NULL, 'ADM005', 'Kiran', '', 'Thapa', 'kiranthapa@gyanstu.edu', '2011-02-09', 'male', 'A-', 'Lalitpur-15', 'Lalitpur', 'Bagmati', '44700', '9800000005', '9810000005', 'parent5@example.com', 'Suresh Thapa', 'Parbati Thapa', 'Aunt Maya', 2, 17, '1', '2020-04-11', 'active', 'kiran.jpg', '2025-11-29 11:37:17', '2025-11-30 07:53:49'),
(9, NULL, 'ADM006', 'Priya', 'Laxmi', 'Bhandari', 'priya@example.com', '2010-12-30', 'female', 'B-', 'Butwal-12', 'Butwal', 'Lumbini', '32900', '9800000006', '9810000006', 'parent6@example.com', 'Hari Bhandari', 'Sita Bhandari', 'Grandpa Ram', 2, NULL, '2', '2020-04-12', 'active', 'priya.jpg', '2025-11-29 11:37:17', '2025-11-29 11:37:17'),
(10, NULL, 'ADM007', 'Manish', '', 'Gurung', 'manish@example.com', '2011-07-14', 'male', 'O-', 'Dharan-6', 'Dharan', 'Koshi', '56700', '9800000007', '9810000007', 'parent7@example.com', 'Daman Gurung', 'Rita Gurung', 'Uncle Bishnu', 2, NULL, '3', '2020-04-13', 'active', 'manish.jpg', '2025-11-29 11:37:17', '2025-11-29 11:37:17'),
(11, NULL, 'ADM008', 'Anita', '', 'Shah', 'anita@example.com', '2009-09-09', 'female', 'A+', 'Birgunj-2', 'Birgunj', 'Madhesh', '44300', '9800000008', '9810000008', 'parent8@example.com', 'Krishna Shah', 'Pooja Shah', 'Aunt Renu', 3, NULL, '1', '2020-04-13', 'active', 'anita.jpg', '2025-11-29 11:37:17', '2025-11-29 11:37:17'),
(12, NULL, 'ADM009', 'Bibek', 'Raj', 'Maharjan', 'bibek@example.com', '2010-04-04', 'male', 'B+', 'Bhaktapur-7', 'Bhaktapur', 'Bagmati', '44800', '9800000009', '9810000009', 'parent9@example.com', 'Manoj Maharjan', 'Kalpana Maharjan', 'Grandpa Hari', 3, NULL, '2', '2020-04-14', 'active', 'bibek.jpg', '2025-11-29 11:37:17', '2025-11-29 11:37:17'),
(13, NULL, 'ADM010', 'Jyoti', '', 'Sharma', 'jyoti@example.com', '2011-03-20', 'female', 'O+', 'Hetauda-3', 'Hetauda', 'Bagmati', '44100', '9800000010', '9810000010', 'parent10@example.com', 'Shankar Sharma', 'Manju Sharma', 'Uncle Sajan', 3, NULL, '3', '2020-04-14', 'active', 'jyoti.jpg', '2025-11-29 11:37:17', '2025-11-29 11:37:17'),
(14, NULL, 'ADM011', 'Roshan', '', 'Magar', 'roshanmagar@gyanstu.edu', '2009-08-17', 'male', 'A+', 'Chitwan-5', 'Chitwan', 'Bagmati', '44200', '9800000011', '9810000011', 'parent11@example.com', 'Bhim Magar', 'Sabitri Magar', 'Aunt Kamala', 4, 14, '1', '2020-04-14', 'active', 'roshan.jpg', '2025-11-29 11:37:17', '2025-11-30 07:23:01'),
(15, NULL, 'ADM012', 'Alisha', 'Rani', 'Jha', 'komaljha@gyanstu.edu', '2010-10-27', 'female', 'AB-', 'Siraha-3', 'Siraha', 'Madhesh', '56500', '9800000012', '9810000012', 'parent12@example.com', 'Mahesh Jha', 'Komal Jha', 'Uncle Arun', 4, 13, '2', '2020-04-14', 'active', 'alisha.jpg', '2025-11-29 11:37:17', '2025-11-30 07:17:04');

-- --------------------------------------------------------

--
-- Table structure for table `student_transport`
--

CREATE TABLE `student_transport` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `pickup_point` varchar(255) DEFAULT NULL,
  `drop_point` varchar(255) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `study_materials`
--

CREATE TABLE `study_materials` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `material_type` enum('notes','video','pdf','link','other') NOT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `external_link` varchar(255) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `name`, `code`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Mathematics', 'MATH', 'Mathematics and numerical skills', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(2, 'Science', 'SCI', 'Scientific concepts and experiments', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(3, 'English', 'ENG', 'English language and literature', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(4, 'Social Studies', 'SOC', 'History, geography, and civics', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(5, 'Nepali', 'NEP', 'Nepali language', 1, '2025-10-22 11:07:23', '2025-12-02 14:09:48'),
(6, 'Computer Science', 'CS', 'Computer basics and programming', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(7, 'Physical Education', 'PE', 'Sports and physical activities', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(8, 'Art', 'ARTS', 'Drawing and creative arts', 1, '2025-10-22 11:07:23', '2025-12-02 14:07:32'),
(9, 'Music', 'MUS', 'Music and singing', 1, '2025-10-22 11:07:23', '2025-10-22 11:07:23'),
(10, 'QUANTUM TECH', 'QT1', 'THIS IS THE END', 1, '2025-11-25 12:54:43', '2025-11-25 12:54:43');

-- --------------------------------------------------------

--
-- Table structure for table `syllabus`
--

CREATE TABLE `syllabus` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `employee_id` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `joining_date` date NOT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive','resigned','retired') DEFAULT 'active',
  `employment_type` enum('full_time','part_time') DEFAULT 'full_time',
  `profile_photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `user_id`, `employee_id`, `first_name`, `middle_name`, `last_name`, `date_of_birth`, `gender`, `blood_group`, `address`, `city`, `state`, `pincode`, `phone`, `emergency_contact`, `qualification`, `experience_years`, `specialization`, `joining_date`, `salary`, `status`, `employment_type`, `profile_photo`, `created_at`, `updated_at`) VALUES
(2, 6, 'SUN001', 'Sunab', NULL, 'Baskota', '2001-09-15', 'male', NULL, 'suryabinayak-4, Tarkhal', 'Bhaktapur', 'Bagmati Province', '44600', '9814945424', '9745520486', 'BCA', 5, 'Computer Application', '2025-11-23', 30000.00, 'active', 'full_time', 'uploads/profiles/profile_photo-wp14182748-krishna-4k-phone-wallpapers-1763889450971-887994919.jpg', '2025-11-23 09:17:31', '2025-11-23 09:17:31'),
(3, 12, 'TCH001', 'Ramesh', 'Kumar', 'Sharma', '1985-03-15', 'male', 'O+', 'Thamel-12', 'Kathmandu', 'Bagmati Province', '44600', '9841234567', '9801234567', 'M.Sc. Mathematics', 8, 'Mathematics', '2020-01-15', 35000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(4, 13, 'TCH002', 'Mukesh', 'Bahadur', 'Thapa', '1988-07-22', 'male', 'A+', 'Lalitpur-5', 'Lalitpur', 'Bagmati Province', '44700', '9851234568', '9811234568', 'M.A. English', 6, 'English Literature', '2021-03-20', 32000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(5, 14, 'TCH003', 'Suresh', 'Prasad', 'Adhikari', '1982-11-10', 'male', 'B+', 'Bhaktapur-8', 'Bhaktapur', 'Bagmati Province', '44800', '9861234569', '9821234569', 'M.Sc. Physics', 10, 'Physics', '2019-06-01', 38000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(6, 15, 'TCH004', 'Manoj', NULL, 'Rai', '1990-05-18', 'male', 'AB+', 'Kirtipur-3', 'Kathmandu', 'Bagmati Province', '44618', '9871234570', '9831234570', 'B.Ed.', 4, 'Social Studies', '2022-07-10', 28000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(7, 16, 'TCH005', 'Kiran', 'Singh', 'Karki', '1987-09-25', 'male', 'O-', 'Baneshwor-10', 'Kathmandu', 'Bagmati Province', '44600', '9881234571', '9841234571', 'M.Sc. Chemistry', 7, 'Chemistry', '2020-08-15', 34000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(8, 17, 'TCH006', 'Dinesh', 'Raj', 'Poudel', '1984-12-30', 'male', 'A-', 'Koteshwor-32', 'Kathmandu', 'Bagmati Province', '44600', '9891234572', '9851234572', 'M.A. Nepali', 9, 'Nepali Language', '2019-04-01', 36000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(9, 18, 'TCH007', 'Kiran', 'Prasad', 'Ghimire', '1991-02-14', 'male', 'B-', 'Balaju-16', 'Kathmandu', 'Bagmati Province', '44600', '9801234573', '9861234573', 'BBS, B.Ed.', 3, 'Accountancy', '2023-01-05', 26000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(10, 19, 'TCH008', 'Kishor', 'Lal', 'Shrestha', '1986-08-08', 'male', 'O+', 'Chabahil-6', 'Kathmandu', 'Bagmati Province', '44600', '9811234574', '9871234574', 'M.Sc. Biology', 8, 'Biology', '2020-02-20', 35000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(11, 20, 'TCH009', 'Nitesh', 'Kumar', 'Bajracharya', '1989-04-12', 'male', 'A+', 'Patan-15', 'Lalitpur', 'Bagmati Province', '44700', '9821234575', '9881234575', 'BCA, MCA', 5, 'Computer Science', '2021-09-01', 33000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(12, 21, 'TCH010', 'Milan', NULL, 'Tamang', '1983-06-20', 'male', 'B+', 'Boudha-6', 'Kathmandu', 'Bagmati Province', '44600', '9831234576', '9891234576', 'M.A. History', 11, 'History', '2018-05-15', 40000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(13, 22, 'TCH011', 'Ashok', 'Bahadur', 'Magar', '1992-01-27', 'male', 'AB-', 'Gongabu-3', 'Kathmandu', 'Bagmati Province', '44600', '9841234577', '9801234577', 'B.Ed. Physical Education', 2, 'Physical Education', '2024-01-09', 24000.00, 'active', 'full_time', 'uploads/profiles/profile_photo-Screenshot_2025-09-16_01_26_45-1764684271511-95635981.png', '2025-11-29 05:43:24', '2025-12-02 14:04:31'),
(14, 23, 'TCH012', 'Bijay', 'Kumar', 'Limbu', '1988-10-05', 'male', 'O-', 'Swayambhu-15', 'Kathmandu', 'Bagmati Province', '44600', '9851234578', '9811234578', 'M.A. Geography', 6, 'Geography', '2021-06-01', 32000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(15, 24, 'TCH013', 'Chandan', 'Prasad', 'Acharya', '1985-03-17', 'male', 'A+', 'Sinamangal-9', 'Kathmandu', 'Bagmati Province', '44600', '9861234579', '9821234579', 'M.Sc. Statistics', 9, 'Statistics', '2019-09-01', 37000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(16, 25, 'TCH014', 'Deepak', 'Raj', 'Kafle', '1990-07-23', 'male', 'B+', 'Naxal-4', 'Kathmandu', 'Bagmati Province', '44600', '9871234580', '9831234580', 'MBA, B.Ed.', 4, 'Business Studies', '2022-08-01', 30000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(17, 26, 'TCH015', 'Ekta', NULL, 'Gurung', '1993-11-30', 'female', 'O+', 'Pulchowk-19', 'Lalitpur', 'Bagmati Province', '44700', '9881234581', '9841234581', 'B.Ed. Art', 3, 'Art & Craft', '2023-03-15', 25000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(18, 27, 'TCH016', 'Firoz', 'Ahmed', 'Khan', '1987-05-08', 'male', 'A-', 'Teku-11', 'Kathmandu', 'Bagmati Province', '44600', '9891234582', '9851234582', 'M.A. Political Science', 7, 'Political Science', '2020-10-01', 34000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(19, 28, 'TCH017', 'Gopal', 'Krishna', 'Pandey', '1986-09-19', 'male', 'B-', 'Jawalakhel-3', 'Lalitpur', 'Bagmati Province', '44700', '9801234583', '9861234583', 'M.A. Economics', 8, 'Economics', '2020-04-01', 36000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24'),
(20, 29, 'TCH018', 'Harish', 'Chandra', 'Joshi', '1991-12-11', 'male', 'AB+', 'Maharajgunj-3', 'Kathmandu', 'Bagmati Province', '44600', '9811234584', '9871234584', 'M.Sc. Environmental Science', 4, 'Environmental Science', '2022-05-01', 31000.00, 'active', 'full_time', NULL, '2025-11-29 05:43:24', '2025-11-29 05:43:24');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_class_assignments`
--

CREATE TABLE `teacher_class_assignments` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_schedules`
--

CREATE TABLE `teacher_schedules` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `period_number` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `academic_year` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable`
--

CREATE TABLE `timetable` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `day_of_week` enum('sunday','monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timetable`
--

INSERT INTO `timetable` (`id`, `class_id`, `section_id`, `subject_id`, `teacher_id`, `day_of_week`, `start_time`, `end_time`, `room_number`, `academic_year`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 14, 11, 8, 2, 'wednesday', '10:00:00', '11:00:00', NULL, '2025', 1, '2025-11-29 11:17:34', '2025-11-29 11:17:34'),
(2, 14, 11, 8, 2, 'sunday', '10:00:00', '11:00:00', NULL, '2025', 1, '2025-11-29 11:21:58', '2025-11-29 11:21:58'),
(3, 4, 13, 8, 13, 'sunday', '10:20:00', '23:00:00', NULL, '2025', 1, '2025-11-29 12:50:34', '2025-11-29 12:50:34'),
(4, 1, 16, 3, 15, 'sunday', '11:20:00', '12:00:00', NULL, '2025', 1, '2025-11-29 12:54:45', '2025-11-29 12:54:45'),
(5, 14, 10, 1, 2, 'thursday', '13:10:00', '14:10:00', NULL, '2025', 1, '2025-12-04 07:14:32', '2025-12-04 07:14:32');

-- --------------------------------------------------------

--
-- Table structure for table `transport_allocations`
--

CREATE TABLE `transport_allocations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `pickup_stop_id` int(11) DEFAULT NULL,
  `drop_stop_id` int(11) DEFAULT NULL,
  `seat_number` varchar(20) DEFAULT NULL,
  `allocation_date` date DEFAULT curdate(),
  `status` enum('active','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transport_allocations`
--

INSERT INTO `transport_allocations` (`id`, `student_id`, `route_id`, `pickup_stop_id`, `drop_stop_id`, `seat_number`, `allocation_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 1, '23', '2025-11-28', 'active', '2025-11-28 08:58:19', '2025-11-28 08:58:19'),
(2, 6, 2, NULL, NULL, '', '2025-11-29', 'active', '2025-11-29 12:04:00', '2025-11-29 12:04:00'),
(3, 7, 2, 6, 6, '', '2025-11-29', 'active', '2025-11-29 12:29:34', '2025-11-29 12:29:34'),
(4, 10, 2, 6, 6, '', '2025-12-03', 'active', '2025-12-03 03:07:10', '2025-12-03 03:07:10');

-- --------------------------------------------------------

--
-- Table structure for table `transport_routes`
--

CREATE TABLE `transport_routes` (
  `id` int(11) NOT NULL,
  `route_name` varchar(255) NOT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `driver_phone` varchar(20) DEFAULT NULL,
  `route_stops` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`route_stops`)),
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `monthly_fee` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `vehicle_id` int(11) DEFAULT NULL,
  `start_point` varchar(100) DEFAULT NULL,
  `end_point` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transport_routes`
--

INSERT INTO `transport_routes` (`id`, `route_name`, `vehicle_number`, `driver_name`, `driver_phone`, `route_stops`, `start_time`, `end_time`, `monthly_fee`, `is_active`, `created_at`, `updated_at`, `vehicle_id`, `start_point`, `end_point`) VALUES
(1, 'bhaktapur', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-28 08:57:59', '2025-11-28 08:57:59', 1, 'Koteshwor', 'Suryabinayak'),
(2, 'Kathmandu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-29 12:03:34', '2025-11-29 12:03:34', 2, 'Jadibuti', 'pitalisadak');

-- --------------------------------------------------------

--
-- Table structure for table `transport_stops`
--

CREATE TABLE `transport_stops` (
  `id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `stop_name` varchar(100) NOT NULL,
  `pickup_time` time DEFAULT NULL,
  `drop_time` time DEFAULT NULL,
  `fare` decimal(10,2) DEFAULT 0.00,
  `sequence_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transport_stops`
--

INSERT INTO `transport_stops` (`id`, `route_id`, `stop_name`, `pickup_time`, `drop_time`, `fare`, `sequence_order`, `created_at`) VALUES
(1, 1, 'Kaushaltar', '17:56:00', '18:01:00', 5.00, 1, '2025-11-28 08:57:59'),
(5, 2, 'koteshwor', '17:48:00', '17:54:00', 2.00, 1, '2025-11-29 12:29:00'),
(6, 2, 'tinkune', '18:13:00', '18:17:00', 2.00, 2, '2025-11-29 12:29:00'),
(7, 2, 'new baneshwor', '18:18:00', '18:22:00', 3.00, 3, '2025-11-29 12:29:00');

-- --------------------------------------------------------

--
-- Table structure for table `transport_vehicles`
--

CREATE TABLE `transport_vehicles` (
  `id` int(11) NOT NULL,
  `bus_number` varchar(50) NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `driver_name` varchar(100) NOT NULL,
  `driver_phone` varchar(20) NOT NULL,
  `sub_driver_name` varchar(100) DEFAULT NULL,
  `sub_driver_phone` varchar(20) DEFAULT NULL,
  `capacity` int(11) DEFAULT 40,
  `status` enum('active','maintenance','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transport_vehicles`
--

INSERT INTO `transport_vehicles` (`id`, `bus_number`, `registration_number`, `driver_name`, `driver_phone`, `sub_driver_name`, `sub_driver_phone`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Ba 38 Pa 2233', '1234H4556', 'Sumit Singh', '9856767887', 'Chunab', '7418529630', 45, 'active', '2025-11-28 08:52:06', '2025-11-29 13:08:17'),
(2, 'BUS-02', 'Ba 98 Pa 3333', 'Ram hari Shrestha', '7896541230', 'Hari Lal ', '1239874560', 41, 'active', '2025-11-29 12:02:10', '2025-11-29 12:02:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','principal','vice_principal','hod','teacher','student','accountant','guard','cleaner') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin@gyan.edu', '$2a$10$iS1c4/I55GqFLgJfLjwuP.cKivj7BJUyo/Z.WY.gaAD82D4rFKeJK', 'super_admin', 1, '2025-12-05 10:46:45', '2025-10-22 11:07:23', '2025-12-05 05:01:45'),
(4, 'prakashtimilsina76@gmail.com', '$2a$10$SYLTPwE2kiY4bHgo1Ch.neI9//pAxsJPgHmq0d8U9w9YWCwdE/jrK', 'student', 1, '2025-10-24 14:45:15', '2025-10-22 18:32:46', '2025-10-24 14:45:15'),
(6, 'sunabbaskota@gmail.com', '$2a$10$i00m7HUdqyMa9V0THW3UzuiNADhaXsi20NVkHIcuYkZOoDmurTLo.', 'teacher', 1, '2025-12-05 10:40:26', '2025-11-23 09:17:31', '2025-12-05 04:55:26'),
(8, 'sunabbaskota15@gmail.com', '$2a$10$XpRgLx8N4aJH2XGjeiPpDeMIN6E8nhGXjdtd55EgAAA4vL9Ogz3xW', 'student', 1, '2025-12-04 15:47:25', '2025-11-23 15:20:26', '2025-12-04 10:02:25'),
(9, 'test1@gmail.com', '$2a$10$qVvLpndVQNAslMVreJ2pSuGK1jssfrqfMAs7raQgQPwM9.1Lvd52W', 'student', 1, '2025-11-30 13:00:41', '2025-11-24 07:51:02', '2025-11-30 07:15:41'),
(10, 'ram@gyanstu.edu', '$2a$10$NFylhsAdZY5p1QtndbEt8.7699D/DW1psHT69tm0R7ged8GBHEkt2', 'student', 1, NULL, '2025-11-29 08:01:01', '2025-11-29 08:01:01'),
(11, 'prasunakhanal@gyanedu.edu', '$2a$10$lv3kF.EYSXYA0CqMkDz6wehjgkzH.RkVmGuM38d7YGAMMHFtjUPl.', 'student', 1, '2025-11-30 13:00:58', '2025-11-29 08:11:27', '2025-11-30 07:15:58'),
(12, 'ramesh3@gmail.com', 'pass1234', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(13, 'mukesh21@gmail.com', 'pass2345', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(14, 'suresh3@gmail.com', 'pass3456', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(15, 'manoj4@gmail.com', 'pass4567', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(16, 'kiran5@gmail.com', 'pass5678', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(17, 'dinesh69@gmail.com', 'pass6789', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(18, 'kiran7@gmail.com', 'pass7890', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(19, 'kishor991@gmail.com', 'pass8901', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(20, 'nitesh109@gmail.com', 'pass9012', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(21, 'milan119@gmail.com', 'pass0123', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(22, 'ashok22@gmail.com', 'pass1235', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(23, 'bijay33@gmail.com', 'pass2346', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(24, 'chandan44@gmail.com', 'pass3457', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(25, 'deepak55@gmail.com', 'pass4568', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(26, 'ekta66@gmail.com', 'pass5679', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(27, 'firoz77@gmail.com', 'pass6780', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(28, 'gopal88@gmail.com', 'pass7891', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(29, 'harish99@gmail.com', 'pass8902', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(30, 'indira100@gmail.com', 'pass9013', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24'),
(31, 'jaya101@gmail.com', 'pass0124', 'teacher', 1, NULL, '2025-11-29 11:28:24', '2025-11-29 11:28:24');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` int(11) NOT NULL,
  `visitor_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `purpose` enum('parent_meeting','vendor','interview','official','guest','other') NOT NULL,
  `purpose_details` text DEFAULT NULL,
  `person_to_meet` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `id_proof_type` varchar(50) DEFAULT NULL,
  `id_proof_number` varchar(100) DEFAULT NULL,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `check_in_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `check_out_time` timestamp NULL DEFAULT NULL,
  `status` enum('checked_in','checked_out') DEFAULT 'checked_in',
  `remarks` text DEFAULT NULL,
  `registered_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admissions`
--
ALTER TABLE `admissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `application_number` (`application_number`),
  ADD KEY `class_applied_for` (`class_applied_for`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_application` (`application_number`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_published` (`published_at`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`created_by`),
  ADD KEY `idx_class_section` (`class_id`,`section_id`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Indexes for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_submission` (`assignment_id`,`student_id`),
  ADD KEY `graded_by` (`graded_by`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`student_id`,`date`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `marked_by` (`marked_by`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_class_section_date` (`class_id`,`section_id`,`date`),
  ADD KEY `idx_submitted` (`class_id`,`section_id`,`date`,`is_submitted`),
  ADD KEY `fk_attendance_subject` (`subject_id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bus_attendance_reports`
--
ALTER TABLE `bus_attendance_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report_date` (`report_date`),
  ADD KEY `idx_route_id` (`route_id`),
  ADD KEY `idx_vehicle_id` (`vehicle_id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `fk_bus_attendance_verifier` (`verified_by`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_grade` (`grade_level`),
  ADD KEY `idx_class_teacher` (`class_teacher_id`);

--
-- Indexes for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_subject` (`class_id`,`subject_id`,`academic_year`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_teacher` (`teacher_id`),
  ADD KEY `idx_class_academic_year` (`class_id`,`academic_year`),
  ADD KEY `idx_active_subjects` (`is_active`);

--
-- Indexes for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_date` (`event_date`),
  ADD KEY `idx_type` (`event_type`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_class_year` (`class_id`,`academic_year`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_result` (`exam_id`,`student_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `entered_by` (`entered_by`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_exam` (`exam_id`);

--
-- Indexes for table `exam_schedule`
--
ALTER TABLE `exam_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_exam_date` (`exam_id`,`exam_date`);

--
-- Indexes for table `fee_heads`
--
ALTER TABLE `fee_heads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fee_payments`
--
ALTER TABLE `fee_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipt_number` (`receipt_number`),
  ADD KEY `fee_structure_id` (`fee_structure_id`),
  ADD KEY `collected_by` (`collected_by`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_receipt` (`receipt_number`);

--
-- Indexes for table `fee_structure`
--
ALTER TABLE `fee_structure`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_class_year` (`class_id`,`academic_year`),
  ADD KEY `fk_fee_structure_head` (`fee_head_id`);

--
-- Indexes for table `hostel_allocations`
--
ALTER TABLE `hostel_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_room` (`room_number`,`building_name`);

--
-- Indexes for table `library_books`
--
ALTER TABLE `library_books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `idx_isbn` (`isbn`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `library_transactions`
--
ALTER TABLE `library_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `issued_by` (`issued_by`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_dates` (`issue_date`,`due_date`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_receiver` (`receiver_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_conversation` (`sender_id`,`receiver_id`,`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_payroll` (`employee_type`,`employee_id`,`month`,`year`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_employee` (`employee_type`,`employee_id`),
  ADD KEY `idx_month_year` (`month`,`year`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_class` (`class_id`);

--
-- Indexes for table `section_subject_teachers`
--
ALTER TABLE `section_subject_teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_section_subject_teacher` (`section_id`,`subject_id`,`academic_year`),
  ADD KEY `idx_section` (`section_id`),
  ADD KEY `idx_teacher` (`teacher_id`),
  ADD KEY `idx_subject` (`subject_id`),
  ADD KEY `idx_section_teacher` (`section_id`,`teacher_id`),
  ADD KEY `idx_teacher_section` (`teacher_id`,`section_id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_employee` (`employee_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admission_number` (`admission_number`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `idx_admission` (`admission_number`),
  ADD KEY `idx_class_section` (`class_id`,`section_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `student_transport`
--
ALTER TABLE `student_transport`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_route` (`route_id`);

--
-- Indexes for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_class_subject` (`class_id`,`subject_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indexes for table `syllabus`
--
ALTER TABLE `syllabus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_class_subject` (`class_id`,`subject_id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_employee` (`employee_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `teacher_class_assignments`
--
ALTER TABLE `teacher_class_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `teacher_schedules`
--
ALTER TABLE `teacher_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_schedule` (`teacher_id`,`day_of_week`,`period_number`,`academic_year`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_teacher` (`teacher_id`),
  ADD KEY `idx_class` (`class_id`),
  ADD KEY `idx_day` (`day_of_week`);

--
-- Indexes for table `timetable`
--
ALTER TABLE `timetable`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `idx_class_section` (`class_id`,`section_id`),
  ADD KEY `idx_day` (`day_of_week`);

--
-- Indexes for table `transport_allocations`
--
ALTER TABLE `transport_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `route_id` (`route_id`),
  ADD KEY `pickup_stop_id` (`pickup_stop_id`),
  ADD KEY `drop_stop_id` (`drop_stop_id`);

--
-- Indexes for table `transport_routes`
--
ALTER TABLE `transport_routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vehicle` (`vehicle_number`),
  ADD KEY `fk_route_vehicle` (`vehicle_id`);

--
-- Indexes for table `transport_stops`
--
ALTER TABLE `transport_stops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `route_id` (`route_id`);

--
-- Indexes for table `transport_vehicles`
--
ALTER TABLE `transport_vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_bus` (`bus_number`),
  ADD UNIQUE KEY `unique_reg` (`registration_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registered_by` (`registered_by`),
  ADD KEY `idx_date` (`check_in_time`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admissions`
--
ALTER TABLE `admissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bus_attendance_reports`
--
ALTER TABLE `bus_attendance_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `class_subjects`
--
ALTER TABLE `class_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `exam_results`
--
ALTER TABLE `exam_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `exam_schedule`
--
ALTER TABLE `exam_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `fee_heads`
--
ALTER TABLE `fee_heads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `fee_payments`
--
ALTER TABLE `fee_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `fee_structure`
--
ALTER TABLE `fee_structure`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hostel_allocations`
--
ALTER TABLE `hostel_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `library_books`
--
ALTER TABLE `library_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `library_transactions`
--
ALTER TABLE `library_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `section_subject_teachers`
--
ALTER TABLE `section_subject_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `student_transport`
--
ALTER TABLE `student_transport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `study_materials`
--
ALTER TABLE `study_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `syllabus`
--
ALTER TABLE `syllabus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `teacher_class_assignments`
--
ALTER TABLE `teacher_class_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_schedules`
--
ALTER TABLE `teacher_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable`
--
ALTER TABLE `timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `transport_allocations`
--
ALTER TABLE `transport_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transport_routes`
--
ALTER TABLE `transport_routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transport_stops`
--
ALTER TABLE `transport_stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `transport_vehicles`
--
ALTER TABLE `transport_vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admissions`
--
ALTER TABLE `admissions`
  ADD CONSTRAINT `admissions_ibfk_1` FOREIGN KEY (`class_applied_for`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admissions_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `announcements_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_4` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attendance_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `bus_attendance_reports`
--
ALTER TABLE `bus_attendance_reports`
  ADD CONSTRAINT `fk_bus_attendance_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bus_attendance_route` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bus_attendance_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `transport_vehicles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bus_attendance_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_class_teacher` FOREIGN KEY (`class_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_subjects_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD CONSTRAINT `daily_reports_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `daily_reports_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_results_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_results_ibfk_4` FOREIGN KEY (`entered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exam_schedule`
--
ALTER TABLE `exam_schedule`
  ADD CONSTRAINT `exam_schedule_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_schedule_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fee_payments`
--
ALTER TABLE `fee_payments`
  ADD CONSTRAINT `fee_payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fee_payments_ibfk_2` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structure` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fee_payments_ibfk_3` FOREIGN KEY (`collected_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `fee_structure`
--
ALTER TABLE `fee_structure`
  ADD CONSTRAINT `fee_structure_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fee_structure_head` FOREIGN KEY (`fee_head_id`) REFERENCES `fee_heads` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hostel_allocations`
--
ALTER TABLE `hostel_allocations`
  ADD CONSTRAINT `hostel_allocations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_allocations_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `library_transactions`
--
ALTER TABLE `library_transactions`
  ADD CONSTRAINT `library_transactions_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `library_books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `library_transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `library_transactions_ibfk_3` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `section_subject_teachers`
--
ALTER TABLE `section_subject_teachers`
  ADD CONSTRAINT `fk_section_subject_teacher_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_section_subject_teacher_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_section_subject_teacher_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_transport`
--
ALTER TABLE `student_transport`
  ADD CONSTRAINT `student_transport_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_transport_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `study_materials`
--
ALTER TABLE `study_materials`
  ADD CONSTRAINT `study_materials_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `study_materials_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `study_materials_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `syllabus`
--
ALTER TABLE `syllabus`
  ADD CONSTRAINT `syllabus_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `syllabus_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `syllabus_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `teacher_class_assignments`
--
ALTER TABLE `teacher_class_assignments`
  ADD CONSTRAINT `teacher_class_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  ADD CONSTRAINT `teacher_class_assignments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  ADD CONSTRAINT `teacher_class_assignments_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Constraints for table `teacher_schedules`
--
ALTER TABLE `teacher_schedules`
  ADD CONSTRAINT `teacher_schedules_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_schedules_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_schedules_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `teacher_schedules_ibfk_4` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `timetable`
--
ALTER TABLE `timetable`
  ADD CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `timetable_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transport_allocations`
--
ALTER TABLE `transport_allocations`
  ADD CONSTRAINT `transport_allocations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transport_allocations_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transport_allocations_ibfk_3` FOREIGN KEY (`pickup_stop_id`) REFERENCES `transport_stops` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `transport_allocations_ibfk_4` FOREIGN KEY (`drop_stop_id`) REFERENCES `transport_stops` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transport_routes`
--
ALTER TABLE `transport_routes`
  ADD CONSTRAINT `fk_route_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `transport_vehicles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transport_stops`
--
ALTER TABLE `transport_stops`
  ADD CONSTRAINT `transport_stops_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `transport_routes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `visitors`
--
ALTER TABLE `visitors`
  ADD CONSTRAINT `visitors_ibfk_1` FOREIGN KEY (`registered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
