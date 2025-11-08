# Authentication Setup - Quick Reference

## ✅ What's Already Done

1. ✅ Supabase client utilities created (`lib/supabase/client.ts` and `lib/supabase/server.ts`)
2. ✅ Auth helper functions created (`lib/auth.ts`)
3. ✅ Auth callback route created (`app/auth/callback/route.ts`)
4. ✅ Middleware for route protection (`middleware.ts`)
5. ✅ All "Get Started" buttons now trigger Google OAuth

## 📋 Google OAuth Console Setup

### Fill in the form:

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

**Your Supabase Project:**
- Project URL: `https://cxhutfirjqebkfcdnbmu.supabase.co`
- Project Ref: `cxhutfirjqebkfcdnbmu`
- Redirect URI: `https://cxhutfirjqebkfcdnbmu.supabase.co/auth/v1/callback`

---

## 📋 Supabase Configuration

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. Paste:
   - **Client ID** (from Google Console)
   - **Client Secret** (from Google Console)
4. Click **Save**

**Site URL in Supabase:**
- Go to **Authentication** → **URL Configuration**
- Set **Site URL** to: `http://localhost:3000` (for development)
- **Redirect URLs** should include: `http://localhost:3000/auth/callback`

---

## 🔧 Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cxhutfirjqebkfcdnbmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🧪 Testing

1. Start your dev server: `pnpm dev`
2. Go to `http://localhost:3000`
3. Click "Get Started" button
4. You should be redirected to Google sign-in
5. After signing in, you'll be redirected back to `/app`

---

## 🔒 How It Works

1. User clicks "Get Started" → `signInWithGoogle()` is called
2. User is redirected to Google OAuth
3. After Google auth, user is redirected to `/auth/callback`
4. Callback route exchanges code for session
5. User is redirected to `/app`
6. Middleware protects `/app` routes (redirects to `/` if not authenticated)

---

## 🐛 Troubleshooting

**"Redirect URI mismatch"**
- Check Google Console redirect URI matches exactly: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- No trailing slashes!

**"Invalid client"**
- Verify Client ID and Secret in Supabase match Google Console
- Make sure Google OAuth client is enabled

**Not redirecting after sign-in**
- Check Supabase Site URL is set to `http://localhost:3000`
- Check redirect URLs include the callback route

**Middleware blocking access**
- Make sure user is authenticated (check Supabase Auth dashboard)
- Verify session cookies are being set

