# Google OAuth Setup Guide for FlowNote

## Step 1: Google Cloud Console Setup

### Fill in the Google OAuth 2.0 Client Form:

**Application type:** ✅ Web application (already selected)

**Name:** ✅ Vibe Voyagers Vibeathon (already filled)

**Authorised JavaScript origins:**
```
http://localhost:3000
https://your-production-domain.com
```
*(Add your production domain when you deploy)*

**Authorised redirect URIs:**
```
https://cxhutfirjqebkfcdnbmu.supabase.co/auth/v1/callback
```

**Your Supabase Project:**
- Project URL: `https://cxhutfirjqebkfcdnbmu.supabase.co`
- Project Ref: `cxhutfirjqebkfcdnbmu`
- Redirect URI: `https://cxhutfirjqebkfcdnbmu.supabase.co/auth/v1/callback`

---

## Step 2: Get Your Google OAuth Credentials

After creating the OAuth client:

1. **Copy the Client ID** - You'll need this for Supabase
2. **Copy the Client Secret** - You'll also need this for Supabase

---

## Step 3: Configure Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** in the list
3. Click **Enable**
4. Fill in:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
5. Click **Save**

**Redirect URL in Supabase:**
- Supabase will automatically use: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- Make sure this matches what you added in Google Console!

---

## Step 4: Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*(You should already have these from the database setup)*

---

## Step 5: Test Authentication

After setup, users can sign in with Google by clicking "Get Started" on your landing page!

---

## Troubleshooting

**"Redirect URI mismatch" error:**
- Make sure the redirect URI in Google Console exactly matches: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- Check for typos, trailing slashes, or http vs https

**"Invalid client" error:**
- Verify Client ID and Client Secret are correct in Supabase
- Make sure Google OAuth client is enabled

**"Origin not allowed" error:**
- Add `http://localhost:3000` to Authorised JavaScript origins in Google Console
- Wait a few minutes for changes to propagate

