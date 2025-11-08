# 🚀 Quick Setup Guide - FlowNote

## Your Supabase Project
- **Project URL:** `https://cxhutfirjqebkfcdnbmu.supabase.co`
- **Project Ref:** `cxhutfirjqebkfcdnbmu`

---

## Step 1: Google OAuth Console

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and fill in:

**Application type:** ✅ Web application

**Name:** ✅ Vibe Voyagers Vibeathon

**Authorised JavaScript origins:**
```
http://localhost:3000
```

**Authorised redirect URIs:**
```
https://cxhutfirjqebkfcdnbmu.supabase.co/auth/v1/callback
```

**Then copy:**
- Client ID
- Client Secret

---

## Step 2: Supabase Configuration

1. Go to: https://cxhutfirjqebkfcdnbmu.supabase.co
2. Navigate to: **Authentication** → **Providers**
3. Find **Google** → Click **Enable**
4. Paste:
   - **Client ID** (from Google)
   - **Client Secret** (from Google)
5. Click **Save**

6. Go to: **Authentication** → **URL Configuration**
7. Set:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** Add `http://localhost:3000/auth/callback`

---

## Step 3: Environment Variables

Create/update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cxhutfirjqebkfcdnbmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**To get your anon key:**
- Supabase Dashboard → **Settings** → **API**
- Copy the **anon/public** key

---

## Step 4: Run Database Setup

1. Go to Supabase Dashboard → **SQL Editor**
2. Open `supabase-setup.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click **Run**

---

## Step 5: Test It!

```bash
pnpm dev
```

1. Go to `http://localhost:3000`
2. Click "Get Started"
3. Sign in with Google
4. You should be redirected to `/app` ✅

---

## ✅ Checklist

- [ ] Google OAuth client created with correct redirect URI
- [ ] Google Client ID & Secret added to Supabase
- [ ] Supabase Site URL set to `http://localhost:3000`
- [ ] `.env.local` file created with Supabase credentials
- [ ] Database tables created (run SQL script)
- [ ] Test authentication flow

---

## 🐛 Common Issues

**Redirect URI mismatch:**
- Make sure redirect URI in Google Console is EXACTLY: `https://cxhutfirjqebkfcdnbmu.supabase.co/auth/v1/callback`
- No trailing slash!

**Not redirecting after sign-in:**
- Check Supabase Site URL is `http://localhost:3000`
- Check redirect URLs include callback route

