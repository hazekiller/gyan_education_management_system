CREATE TABLE `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `expense_head` varchar(100) DEFAULT NULL,
  `payment_method` enum('cash','cheque','bank_transfer','online') DEFAULT 'cash',
  `reference_no` varchar(100) DEFAULT NULL COMMENT 'Tally Voucher/Reference Number',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expense_date` (`expense_date`)
);
