# Debug Guide: Fix "Hello there" Instead of User Name

## Issue
The dashboard shows "Hello there" instead of your actual name from Google OAuth.

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Sign in with Google
4. Look for these logs:

### Expected Logs:
```
Auth User: { id: "...", email: "...", user_metadata: {...}, raw_user_meta_data: {...} }
[getDisplayName] Found ... or Using email username: ...
```

### What to Check:
- **If you see `[getDisplayName] No authUser, returning 'there'`**: 
  - The auth user isn't loading. Check if you're signed in.
  
- **If you see `Auth User:` but all fields are empty/null**:
  - Google OAuth isn't sending user data. Check Supabase Google OAuth configuration.

- **If you see `Auth User:` with data but name is still "there"**:
  - The name extraction logic needs adjustment based on what Google is actually sending.

## Step 2: Check What Google is Sending

In the console, find the `Auth User:` log and check:

1. **`user_metadata`** - Should contain `full_name` or `name`
2. **`raw_user_meta_data`** - Should contain `given_name`, `family_name`, or `name`
3. **`email`** - Should always be present

### Common Google OAuth Data Structure:
```javascript
{
  user_metadata: {
    full_name: "John Doe",
    avatar_url: "..."
  },
  raw_user_meta_data: {
    given_name: "John",
    family_name: "Doe",
    name: "John Doe",
    email: "john@example.com"
  }
}
```

## Step 3: Fix Based on Console Output

### Scenario A: `authUser` is null
**Problem**: User isn't authenticated or session expired.

**Fix**:
1. Sign out and sign in again
2. Check if Supabase session is valid
3. Check browser cookies for Supabase session

### Scenario B: `user_metadata` and `raw_user_meta_data` are both empty
**Problem**: Google OAuth isn't configured to send profile data.

**Fix**:
1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Make sure it's **Enabled**
3. Check that **Client ID** and **Client Secret** are correct
4. In Google Cloud Console, make sure your OAuth client has these scopes:
   - `openid`
   - `email`
   - `profile`
5. Re-authenticate (sign out and sign in again)

### Scenario C: Data exists but name extraction fails
**Problem**: The name is in a different field than expected.

**Fix**: 
1. Copy the exact structure from the console log
2. Update `lib/hooks/use-profile.ts` in the `getDisplayName()` function
3. Add a check for the specific field where your name is located

## Step 4: Manual Database Check

1. Go to **Supabase Dashboard** → **Table Editor** → **profiles**
2. Find your user's profile row
3. Check the `nickname` column:
   - If it's `null` or `"User"`: The profile creation didn't extract the name
   - If it has a value: The frontend isn't reading it correctly

### If nickname is null/User:
Run this SQL in Supabase SQL Editor (replace `YOUR_USER_ID`):

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Then update your profile (replace with your actual user ID)
UPDATE profiles 
SET nickname = (
  SELECT 
    COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name',
      (raw_user_meta_data->>'given_name' || ' ' || raw_user_meta_data->>'family_name'),
      raw_user_meta_data->>'given_name',
      split_part(email, '@', 1)
    )
  FROM auth.users 
  WHERE auth.users.id = profiles.id
)
WHERE id = 'YOUR_USER_ID_HERE';
```

## Step 5: Verify Supabase Google OAuth Configuration

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
   - ✅ Enabled: Yes
   - ✅ Client ID: Your Google OAuth Client ID
   - ✅ Client Secret: Your Google OAuth Client Secret

2. **Google Cloud Console** → **APIs & Services** → **Credentials**
   - ✅ OAuth 2.0 Client ID exists
   - ✅ Authorized redirect URIs includes: `https://cxhutfirjqebkfcdnbmu.supabase.co/auth/v1/callback`
   - ✅ Scopes include: `openid`, `email`, `profile`

## Step 6: Test the Fix

1. **Clear browser cache and cookies** for your site
2. **Sign out** completely
3. **Sign in again** with Google
4. **Check console logs** - you should see your name being extracted
5. **Check the dashboard** - should show "Hello [Your Name]"

## Quick Fix: Force Update Profile

If you want to manually set your name, go to **Settings** page and update your nickname there. It should then show up everywhere.

## Still Not Working?

Share the console output of:
1. The `Auth User:` log (the full object)
2. The `[getDisplayName]` logs
3. Any error messages

This will help identify exactly where the issue is.

