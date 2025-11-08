-- ============================================
-- Quick Fix: Update Profile Names from Auth Users
-- ============================================
-- Run this in Supabase SQL Editor to fix existing profiles
-- ============================================

-- This will update all profiles that have null or "User" nickname
-- with the actual name from their Google OAuth data

UPDATE profiles
SET 
  nickname = COALESCE(
    -- Try to get name from auth.users metadata
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.id),
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.id),
    -- Combine given_name + family_name
    (
      SELECT 
        CASE 
          WHEN (raw_user_meta_data->>'given_name') IS NOT NULL 
            AND (raw_user_meta_data->>'family_name') IS NOT NULL
          THEN CONCAT(raw_user_meta_data->>'given_name', ' ', raw_user_meta_data->>'family_name')
          ELSE NULL
        END
      FROM auth.users 
      WHERE auth.users.id = profiles.id
    ),
    -- Just given_name
    (SELECT raw_user_meta_data->>'given_name' FROM auth.users WHERE auth.users.id = profiles.id),
    -- Email username as fallback
    (SELECT split_part(email, '@', 1) FROM auth.users WHERE auth.users.id = profiles.id),
    -- Keep existing if none found
    profiles.nickname
  ),
  updated_at = NOW()
WHERE 
  profiles.nickname IS NULL 
  OR profiles.nickname = 'User'
  OR profiles.nickname = 'there';

-- Verify the update
SELECT 
  p.id,
  p.nickname,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name_from_auth,
  u.raw_user_meta_data->>'given_name' as given_name_from_auth,
  u.raw_user_meta_data->>'family_name' as family_name_from_auth
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.updated_at DESC
LIMIT 10;

