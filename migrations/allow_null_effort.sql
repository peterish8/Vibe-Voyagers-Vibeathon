-- Migration: Allow NULL effort values for physical activities
-- This allows tasks to have NULL effort (for physical activities) instead of requiring 'small', 'medium', or 'large'

-- Step 1: Drop the existing CHECK constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_effort_check;

-- Step 2: Add new CHECK constraint that allows NULL
ALTER TABLE tasks ADD CONSTRAINT tasks_effort_check 
  CHECK (effort IN ('small', 'medium', 'large') OR effort IS NULL);

-- Step 3: Update default to NULL (optional, but recommended)
ALTER TABLE tasks ALTER COLUMN effort SET DEFAULT NULL;

-- Note: Existing tasks with 'medium' effort will remain unchanged
-- You may want to update physical activity tasks manually if needed

