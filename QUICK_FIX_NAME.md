# Quick Fix: Name Not Showing

## Option 1: Run SQL Script (Fastest)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `FIX_PROFILE_NAME.sql`
3. Click **Run**
4. Refresh your app - your name should now show!

## Option 2: Manual Fix via Settings

1. Go to **Settings** page in the app
2. Update your **Nickname** field with your name
3. Click **Save**
4. Your name should now appear everywhere

## Option 3: Check Console Logs

1. Open browser **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for these logs:
   - `Auth User:` - Shows what data Google sent
   - `[getDisplayName]` - Shows which name source was used

### If you see `[getDisplayName] No authUser`:
- Sign out and sign in again
- Check if you're properly authenticated

### If you see `Auth User:` but name is still "there":
- Check what fields have data in `user_metadata` or `raw_user_meta_data`
- The name might be in a different field than expected
- Share the console output and we can fix the extraction logic

## Option 4: Verify Google OAuth Setup

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
   - ✅ Must be **Enabled**
   - ✅ **Client ID** and **Client Secret** must be filled

2. **Google Cloud Console** → Your OAuth Client
   - ✅ **Authorized redirect URIs** must include:
     ```
     https://cxhutfirjqebkfcdnbmu.supabase.co/auth/v1/callback
     ```
   - ✅ **Scopes** should include: `openid`, `email`, `profile`

3. **Re-authenticate**: Sign out completely and sign in again

## Still Not Working?

**Share this information:**
1. Screenshot of the `Auth User:` console log
2. Screenshot of any `[getDisplayName]` logs
3. What your profile nickname shows in Supabase Table Editor

This will help identify the exact issue!

