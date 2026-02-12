ALTER TABLE `users` MODIFY COLUMN `role` ENUM('super_admin','principal','vice_principal','hod','teacher','student','accountant','guard','cleaner','hr','founder','staff') NOT NULL;
