
-- 1. Create temporary index for student_id FK
CREATE INDEX idx_student_temp ON attendance (student_id);

-- 2. Drop the existing unique index
DROP INDEX unique_attendance ON attendance;

-- 3. Add the new unique index including subject_id
-- This index starts with student_id, so it can satisfy the FK requirement.
CREATE UNIQUE INDEX unique_attendance ON attendance (student_id, date, subject_id);

-- 4. Drop the temporary index
DROP INDEX idx_student_temp ON attendance;
